import type { Store } from "../types";
import { hospitals, divisions } from "../seed/bangladesh-amr-seed";
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const numeric = (value: unknown, min: number, max: number) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max;
export function validStore(value: unknown): value is Store {
  if (
    !object(value) ||
    value.schema !== 1 ||
    !Array.isArray(value.samples) ||
    value.samples.length < 6 ||
    !Array.isArray(value.confirmations) ||
    !numeric(value.modelVersion, 0, 10000) ||
    !object(value.weights) ||
    !numeric(value.weights.qrdr, 0, 1000) ||
    !numeric(value.weights.gene, 0, 1000)
  )
    return false;
  const samples = value.samples;
  if (
    !samples.every(
      (s) =>
        object(s) &&
        [
          "id",
          "sample_code",
          "patient_alias",
          "patient_sex",
          "ward_unit",
          "specimen_type",
          "empirical_drug",
          "organism",
          "title",
          "collected_at",
        ].every((k) => typeof s[k] === "string") &&
        hospitals.some((h) => h.id === s.hospital_id) &&
        divisions.some((d) => d === s.division) &&
        numeric(s.patient_age, 0, 120) &&
        numeric(s.internal_control_ct, 0, 45) &&
        numeric(s.current_stage, 1, 5) &&
        typeof s.step_down === "boolean" &&
        typeof s.ventilated === "boolean" &&
        Number.isFinite(Date.parse(s.collected_at as string)) &&
        object(s.targets) &&
        Object.values(s.targets).every((ct) => numeric(ct, 0, 45)) &&
        Array.isArray(s.mutations) &&
        s.mutations.every((m) => typeof m === "string"),
    )
  )
    return false;
  return value.confirmations.every(
    (r) =>
      object(r) &&
      typeof r.id === "string" &&
      samples.some((s) => s.id === r.sample_id) &&
      typeof r.antibiotic_name === "string" &&
      ["S", "I", "R"].includes(String(r.predicted_sir)) &&
      ["S", "I", "R"].includes(String(r.confirmed_sir)) &&
      numeric(r.phenotypic_mic, 0, 100000) &&
      typeof r.confirmed_at === "string",
  );
}
