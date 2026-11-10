import test from "node:test";
import assert from "node:assert/strict";
import { seed } from "../src/lib/seed/bangladesh-amr-seed";
import {
  classify,
  simulateQpcr,
} from "../src/lib/bioinformatics/qpcr-simulator";
import { decide } from "../src/lib/bioinformatics/reflex-decision-engine";
import { interpret } from "../src/lib/bioinformatics/interpretation-engine";
import { simulateTrace } from "../src/lib/bioinformatics/sanger-ab1-simulator";
import { metrics } from "../src/lib/bioinformatics/validation";
import { validStore } from "../src/lib/data/validate-store";
import type { Confirmation } from "../src/lib/types";
import {
  findReference,
  compareReference,
  referenceDatabase,
  translateCodon,
} from "../src/lib/bioinformatics/reference-comparison";
const samples = seed().samples;
test("invalid local or cloud snapshots cannot enter the workflow", () => {
  assert.equal(validStore(seed()), true);
  assert.equal(validStore({ ...seed(), weights: null }), false);
  const broken = seed();
  broken.samples[0].targets["mcr-1"] = NaN;
  assert.equal(validStore(broken), false);
});
test("ME and VME use reference-class denominators", () => {
  const rows = [
    ["R", "R"],
    ["S", "R"],
    ["S", "S"],
    ["R", "S"],
    ["S", "S"],
    ["I", "R"],
  ].map(([predicted_sir, confirmed_sir]) => ({
    predicted_sir,
    confirmed_sir,
  })) as Confirmation[];
  const m = metrics(rows);
  assert.equal(m.vme, 50);
  assert.ok(Math.abs(m.me! - 100 / 3) < 1e-10);
  assert.ok(Math.abs(m.bacc! - (0.5 + 2 / 3) * 50) < 1e-10);
});
test("seed is deterministic with 66 isolates and 8 divisions", () => {
  assert.deepEqual(seed(), seed());
  assert.equal(samples.length, 66);
  assert.equal(new Set(samples.map((s) => s.division)).size, 8);
});
test("Ct boundary classes and 40 cycles", () => {
  assert.equal(classify(34.9), "POSITIVE");
  assert.equal(classify(35), "BORDERLINE_INDETERMINATE");
  assert.equal(classify(38), "BORDERLINE_INDETERMINATE");
  assert.equal(classify(38.1), "NEGATIVE");
  assert.equal(simulateQpcr(samples[0].targets).length, 40);
});
test("archetype routes and fees", () => {
  assert.deepEqual(
    samples.slice(0, 6).map((s) => decide(s).fee),
    [1200, 2050, 2050, 1200, 1200, 1200],
  );
});
test("QC failure prevents reflex", () => {
  assert.equal(decide({ ...samples[1], internal_control_ct: 40 }).qc, true);
  assert.equal(
    decide({ ...samples[1], internal_control_ct: 40 }).reflex,
    false,
  );
});
test("borderline triggers verification without high-impact marker", () => {
  const s = structuredClone(samples[5]);
  s.targets["mcr-1"] = 36;
  assert.equal(decide(s).reflex, true);
});
test("mcr-1 changes colistin result and QRDR changes ciprofloxacin", () => {
  const s = structuredClone(samples[2]);
  const get = (drug: string) =>
    interpret(s).find((p) => p.antibiotic_name === drug)!.predicted_sir;
  assert.equal(get("Colistin"), "S");
  s.targets["mcr-1"] = 24;
  assert.equal(get("Colistin"), "R");
  assert.equal(get("Ciprofloxacin"), "S");
  s.mutations = ["S83L", "D87N"];
  assert.equal(get("Ciprofloxacin"), "R");
});
test("MBL resists avibactam monotherapy and trace mutation changes correct codon", () => {
  assert.equal(
    interpret(samples[0]).find(
      (p) => p.antibiotic_name === "Ceftazidime-Avibactam",
    )!.predicted_sir,
    "R",
  );
  assert.equal(simulateTrace("gyrA", []).codons[3], "TCG");
  assert.equal(simulateTrace("gyrA", ["S83L"]).codons[3], "TTG");
  assert.equal(simulateTrace("parC", ["S80I"]).codons[4], "ATC");
});
test("empty validation has no fabricated accuracy", () =>
  assert.equal(metrics([]).bacc, null));

test("reference snapshot has four 33-base coding windows and exact species matching", () => {
  assert.equal(referenceDatabase.records.length, 4);
  for (const r of referenceDatabase.records) {
    assert.match(r.sequence, /^[ACGT]{33}$/);
    const result = compareReference(r.sequence, r);
    assert.equal(result.status, "compared");
    if (result.status === "compared") {
      assert.equal(result.identity, 100);
      assert.equal(result.differences, 0);
    }
  }
  assert.equal(
    findReference("Klebsiella pneumoniae (ST11)", "gyrA")?.accession,
    "AF052258.1",
  );
  assert.equal(findReference("Acinetobacter baumannii", "gyrA"), undefined);
  assert.equal(findReference("Klebsiella oxytoca", "gyrA"), undefined);
});

test("Sanger differences are calculated from bases, with correct coding coordinates", () => {
  const r = findReference("Escherichia coli", "gyrA")!;
  const result = compareReference(
    simulateTrace("gyrA", ["S83L", "D87N"]).sequence,
    r,
  );
  assert.equal(result.status, "compared");
  if (result.status !== "compared") return;
  assert.equal(result.differences, 2);
  assert.equal(result.identity, (31 / 33) * 100);
  assert.deepEqual(
    result.rows.filter((r) => r.changed).map((r) => r.label),
    ["S83L", "D87N"],
  );
  assert.deepEqual(
    result.rows
      .flatMap((r) => r.bases)
      .filter((b) => b.changed)
      .map((b) => b.position),
    [248, 259],
  );
  assert.ok(result.rows[3].annotations.length > 0);
});

test("species-specific parC uses its actual source codon and amino-acid annotations", () => {
  const r = findReference("Klebsiella pneumoniae", "parC")!;
  assert.equal(simulateTrace("parC", [], r.species).codons[4], "AGT");
  const result = compareReference(
    simulateTrace("parC", ["S80I"], r.species).sequence,
    r,
  );
  if (result.status !== "compared") return assert.fail("expected comparison");
  assert.equal(result.differences, 1);
  assert.equal(result.rows[4].sampleCodon, "ATT");
  assert.equal(result.rows[4].label, "S80I");
  assert.ok(
    result.rows[4].annotations.some(
      (a) => a.referenceCodon !== result.rows[4].refCodon,
    ),
  );
});

test("ambiguous, invalid, synonymous and uncatalogued calls are not false database hits", () => {
  const r = findReference("Escherichia coli", "gyrA")!;
  assert.equal(compareReference("ACGT", r).status, "invalid");
  assert.equal(compareReference("-".repeat(33), r).status, "invalid");
  const unknown = compareReference("N".repeat(33), r);
  if (unknown.status !== "compared")
    return assert.fail("expected unresolved window");
  assert.equal(unknown.identity, null);
  assert.equal(unknown.comparedBases, 0);
  assert.equal(unknown.differences, 0);
  assert.ok(
    unknown.rows.every(
      (r) => r.kind === "Unresolved" && r.annotations.length === 0,
    ),
  );
  const synonymous = compareReference("CAC" + r.sequence.slice(3), r);
  if (synonymous.status === "compared")
    assert.equal(synonymous.rows[0].kind, "Synonymous");
  const unlisted = compareReference("AAA" + r.sequence.slice(3), r);
  if (unlisted.status === "compared")
    assert.equal(unlisted.rows[0].kind, "Uncatalogued substitution");
  assert.equal(translateCodon("AGT"), "S");
  assert.equal(translateCodon("ATT"), "I");
});
