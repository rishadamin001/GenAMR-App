import { createClient } from "@supabase/supabase-js";
import { seed } from "../seed/bangladesh-amr-seed";
import type { Store } from "../types";
import { validStore } from "./validate-store";
import { interpret } from "../bioinformatics/interpretation-engine";
import { decide } from "../bioinformatics/reflex-decision-engine";
import { simulateTrace, primers } from "../bioinformatics/sanger-ab1-simulator";
import { concordance, metrics } from "../bioinformatics/validation";
const key = "genamr-demo-v1";
let memory: Store = seed();
export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (validStore(parsed)) memory = parsed;
    }
  } catch {
    /* Storage unavailable or invalid: use deterministic seed. */
  }
  return memory;
}
export function saveStore(store: Store) {
  memory = store;
  try {
    localStorage.setItem(key, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && publicKey ? createClient(url, publicKey) : null;
// Stable owner-scoped identifiers make interrupted uploads safely retryable without cross-user collisions.
async function cloudId(value: string) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  );
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes.slice(0, 16), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
let syncQueue: Promise<string> = Promise.resolve("Local mode");
export function syncStore(store: Store): Promise<string> {
  syncQueue = syncQueue.then(
    () => uploadStore(store),
    () => uploadStore(store),
  );
  return syncQueue;
}
async function uploadStore(store: Store): Promise<string> {
  if (!supabase) return "Local mode • saved on this device";
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return "Cloud configured • sign in required; local changes retained";
    const client = supabase;
    const sampleRows = [],
      qpcrRows = [],
      predictionRows = [],
      sangerRows = [],
      confirmationRows = [];
    const ids = new Map<string, string>();
    for (const s of store.samples) {
      const id = await cloudId(user.id + s.id);
      ids.set(s.id, id);
      const d = decide(s);
      sampleRows.push({
        id,
        owner_id: user.id,
        hospital_id: s.hospital_id,
        sample_code: s.sample_code,
        patient_alias: s.patient_alias,
        patient_age: s.patient_age,
        patient_sex: s.patient_sex,
        ward_unit: s.ward_unit,
        ventilated: s.ventilated,
        specimen_type: s.specimen_type,
        empirical_drug: s.empirical_drug,
        current_stage: s.current_stage,
        reflex_triggered: d.reflex,
        reflex_reason: d.reason,
        base_fee_bdt: 1200,
        sequencing_fee_bdt: d.reflex ? 850 : 0,
        collected_at: s.collected_at,
        reported_at: null,
      });
      qpcrRows.push({
        id: await cloudId(id + "qpcr"),
        sample_id: id,
        organism_detected: s.organism,
        internal_control_ct: s.internal_control_ct,
        run_status: d.qc ? "qc_fail" : "pass",
        targets_json: s.targets,
        completed_at: s.collected_at,
      });
      if (!d.qc)
        for (const p of interpret(s))
          predictionRows.push({
            id: await cloudId(id + p.antibiotic_name),
            sample_id: id,
            ...p,
          });
      if (d.reflex)
        for (const locus of d.loci.filter(
          (l) => l !== "borderline_verification",
        )) {
          const qrdr = locus.startsWith("gyrA") ? "gyrA" : "parC";
          sangerRows.push({
            id: await cloudId(id + locus),
            sample_id: id,
            target_locus: locus,
            primer_pair: locus.includes("QRDR")
              ? primers[qrdr]
              : primers[locus.startsWith("blaSHV") ? "blaSHV" : "blaTEM"],
            amplicon_bp: locus.startsWith("blaTEM") ? 861 : 441,
            ab1_trace_json: locus.includes("QRDR")
              ? simulateTrace(qrdr, s.mutations)
              : { synthetic: true, allele_mutations: s.mutations },
            mutations_detected: s.mutations,
            completed_at: s.collected_at,
          });
        }
    }
    for (const r of store.confirmations) {
      const sample_id = ids.get(r.sample_id);
      if (sample_id)
        confirmationRows.push({
          id: await cloudId(user.id + r.id),
          sample_id,
          antibiotic_name: r.antibiotic_name,
          phenotypic_mic: r.phenotypic_mic,
          confirmed_sir: r.confirmed_sir,
          concordance_type: concordance(r.predicted_sir, r.confirmed_sir),
          logged_by: user.id,
          confirmed_at: r.confirmed_at,
        });
    }
    for (const [table, rows] of [
      ["samples", sampleRows],
      ["qpcr_runs", qpcrRows],
      ["sanger_runs", sangerRows],
      ["ast_predictions", predictionRows],
      ["phenotypic_ast_confirmations", confirmationRows],
    ] as const) {
      if (rows.length) {
        const { error } = await client.from(table).upsert(rows);
        if (error) throw error;
      }
    }
    const m = metrics(store.confirmations);
    const { error } = await client.from("ml_model_versions").upsert(
      {
        owner_id: user.id,
        version_tag: "demo-snapshot",
        training_samples_count: store.confirmations.length,
        balanced_accuracy: m.bacc,
        me_rate: m.me,
        vme_rate: m.vme,
        feature_weights_json: { snapshot: store },
        deployed_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,version_tag" },
    );
    if (error) throw error;
    return "Cloud sync complete • normalized records + snapshot";
  } catch (error) {
    return `Cloud sync failed • local changes retained: ${error instanceof Error ? error.message : "check migration and access policies"}`;
  }
}
export async function pullStore(): Promise<Store | null> {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("ml_model_versions")
    .select("feature_weights_json")
    .eq("owner_id", user.id)
    .eq("version_tag", "demo-snapshot")
    .maybeSingle();
  if (error) throw error;
  const snapshot = data?.feature_weights_json?.snapshot as Store | undefined;
  return validStore(snapshot) ? snapshot : null;
}
