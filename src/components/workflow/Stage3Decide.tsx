import { decide } from "@/lib/bioinformatics/reflex-decision-engine";
import type { StageProps } from "./Stage1Collect";
export function Stage3Decide({
  sample: s,
  update,
  currency,
}: { currency: string } & StageProps) {
  const d = decide(s);
  return (
    <>
      <section className="card">
        <div className="section-label">03 / PRECISION REFLEX GATE</div>
        <h2>Sequence only when it adds information.</h2>
        <p>{d.reason}</p>
        <div className="decision-grid">
          <div className={!d.reflex ? "track active" : "track"}>
            <span className="big-number">
              02<span>h</span>
            </span>
            <h3>Fast track</h3>
            <p>
              High-impact markers resolved by qPCR. Skip routine Sanger cost.
            </p>
            <strong>1,200 BDT / $10</strong>
          </div>
          <div className="gate">→</div>
          <div className={d.reflex ? "track active" : "track"}>
            <span className="big-number">
              04<span>h</span>
            </span>
            <h3>Targeted reflex</h3>
            <p>
              Resolve QRDR mutations, β-lactamase alleles or borderline signals.
            </p>
            <strong>2,050 BDT / $17</strong>
          </div>
        </div>
        <div className="callout" data-testid="decision">
          {d.qc
            ? "QC HOLD"
            : d.reflex
              ? "TRIGGER STAGE 4 TARGETED SANGER"
              : "STOP AT STAGE 2"}{" "}
          · Total fee{" "}
          {currency === "BDT"
            ? `${d.fee.toLocaleString("en-US")} BDT`
            : d.reflex
              ? "$17"
              : "$10"}
        </div>
        {d.reflex && <p>Requested targets: {d.loci.join(", ")}</p>}
        <label className="check">
          <input
            type="checkbox"
            checked={s.step_down}
            onChange={(e) => update({ step_down: e.target.checked })}
          />
          Evaluate fluoroquinolone step-down
        </label>
        {d.borderline && (
          <p className="alert">
            Borderline result requires laboratory review even if another marker
            ends routine reflex routing.
          </p>
        )}
      </section>
      <section className="card">
        <h2>Time and cost, in perspective</h2>
        <div className="comparison">
          {[
            ["GenAMR screening", "2h", "৳1,200"],
            ["GenAMR + targeted Sanger", "4h", "৳2,050"],
            ["BioFire BCID", "Platform-dependent", "Local quote required"],
            ["Conventional culture + AST", "48–72h", "Local quote required"],
            ["Conventional WGS", "Workflow-dependent", "৳12,500+ / $105+"],
          ].map((row) => (
            <div key={row[0]}>
              <strong>{row[0]}</strong>
              <span>{row[1]}</span>
              <span>{row[2]}</span>
            </div>
          ))}
        </div>
        <p className="muted">
          Concept pricing and turnaround targets; not validated service
          commitments.
        </p>
      </section>
    </>
  );
}
