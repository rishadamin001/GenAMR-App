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
