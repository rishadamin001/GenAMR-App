import { useState } from "react";
import type { Store, Sample, SIR, Confirmation } from "@/lib/types";
import {
  interpret,
  antibiotics,
} from "@/lib/bioinformatics/interpretation-engine";
import { metrics, concordance } from "@/lib/bioinformatics/validation";
import { Button } from "../ui/button";
export function AstValidationLoop({
  store,
  sample,
  onChange,
}: {
  store: Store;
  sample: Sample;
  onChange: (store: Store) => void;
}) {
  const [drug, setDrug] = useState("Ciprofloxacin"),
    [sir, setSir] = useState<SIR>("R"),
    [mic, setMic] = useState(4);
  const m = metrics(store.confirmations);
  function add() {
    const prediction = interpret(sample).find(
      (p) => p.antibiotic_name === drug,
    )!;
    const row: Confirmation = {
      id: crypto.randomUUID(),
      sample_id: sample.id,
      antibiotic_name: drug,
      predicted_sir: prediction.predicted_sir,
      confirmed_sir: sir,
      phenotypic_mic: mic,
      confirmed_at: new Date().toISOString(),
    };
    onChange({ ...store, confirmations: [...store.confirmations, row] });
  }
  function retrain() {
    const rows = store.samples.flatMap((s) =>
      interpret(s).map(
        (p, i): Confirmation => ({
          id: `batch-${s.id}-${i}`,
          sample_id: s.id,
          antibiotic_name: p.antibiotic_name,
          predicted_sir: p.predicted_sir,
          confirmed_sir:
            (i + Number(s.sample_code.slice(-3))) % 23 === 0
              ? p.predicted_sir === "R"
                ? "S"
                : "R"
              : p.predicted_sir,
          phenotypic_mic: p.predicted_sir === "R" ? 16 : 0.5,
          confirmed_at: new Date().toISOString(),
        }),
      ),
    );
    onChange({
      ...store,
      modelVersion: store.modelVersion + 1,
      weights: { gene: 1, qrdr: 1.8 + store.modelVersion * 0.05 },
      confirmations: [
        ...store.confirmations.filter((r) => !r.id.startsWith("batch-")),
        ...rows,
      ],
    });
  }
  return (
    <>
      <section className="card">
        <div className="section-label">CLOSED-LOOP VALIDATION</div>
        <h2>Predictions need a ground truth.</h2>
        <p className="muted">
          Reconcile screening calls against 48–72-hour phenotypic AST. Metrics
          are calculated from the records below, not claimed clinical
          performance.
        </p>
        <div className="metrics">
          {[
            ["Balanced accuracy", m.bacc],
            ["Major error · false R", m.me],
            ["Very major error · false S", m.vme],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <small>{label}</small>
              <strong>
                {value === null ? "—" : `${Number(value).toFixed(1)}%`}
              </strong>
            </div>
          ))}
        </div>
        <div className="form-grid">
          <label>
            Antibiotic
            <select value={drug} onChange={(e) => setDrug(e.target.value)}>
              {antibiotics.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Confirmed AST
            <select value={sir} onChange={(e) => setSir(e.target.value as SIR)}>
              {["R", "S", "I"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            MIC (mg/L)
            <input
              type="number"
              min="0"
              step=".125"
              value={mic}
              onChange={(e) => setMic(Number(e.target.value))}
            />
          </label>
        </div>
        <div className="actions">
          <Button onClick={add}>Log synthetic AST confirmation</Button>
          <Button variant="outline" onClick={retrain}>
            Simulate Batch AST Confirmation & Retrain ML Model
          </Button>
        </div>
        <p role="status">
          Model v1.{store.modelVersion} · {m.n} reconciled records · QRDR weight{" "}
          {store.weights.qrdr.toFixed(2)}
        </p>
        <div className="callout">
          Simulation only: this button changes deterministic weights and
          synthetic confirmations. It does not train a clinical ML model. The
          requested 16.5% → 0.5% VME comparison is an unverified concept target,
          not a measured outcome.
        </div>
        <p className="muted">
          ME denominator: reference S. VME denominator: reference R. Balanced
          accuracy averages sensitivity and specificity. I pairs are excluded
          from binary metrics; an absent class yields no estimate.
        </p>
      </section>
      <section className="card">
        <h3>Recent reconciliation records</h3>
        {store.confirmations
          .slice(-8)
          .reverse()
          .map((r) => (
            <div className="validation-row" key={r.id}>
              <strong>{r.antibiotic_name}</strong>
              <span>
                {r.predicted_sir} → {r.confirmed_sir}
              </span>
              <span>{concordance(r.predicted_sir, r.confirmed_sir)}</span>
            </div>
          ))}
        {!m.n && (
          <p>No confirmations yet. Log a result or run the synthetic batch.</p>
        )}
      </section>
    </>
  );
}
