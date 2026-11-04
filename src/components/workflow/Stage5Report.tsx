import { interpret } from "@/lib/bioinformatics/interpretation-engine";
import { decide } from "@/lib/bioinformatics/reflex-decision-engine";
import type { StageProps } from "./Stage1Collect";
import { Button } from "../ui/button";
export function Stage5Report({ sample: s }: StageProps) {
  const predictions = interpret(s),
    d = decide(s),
    mismatch =
      predictions.find((p) => p.antibiotic_name === s.empirical_drug)
        ?.predicted_sir === "R";
  if (d.qc)
    return (
      <section className="card alert">
        <h2>QC HOLD — report withheld</h2>
        <p>{d.reason}</p>
      </section>
    );
  return (
    <>
      <section className="report-header">
        <div>
          <div className="section-label">05 / CLINICIAN REPORT • SYNTHETIC</div>
          <h2>From resistance signal to informed review.</h2>
          <p>
            {s.sample_code} · {s.organism} · {s.patient_alias}
          </p>
        </div>
        <Button
          className="no-print"
          variant="outline"
          onClick={() => window.print()}
        >
          Print / Save PDF
        </Button>
      </section>
      {mismatch && (
        <div className="alert" role="alert">
          <strong>Empirical therapy mismatch: {s.empirical_drug} → R</strong>
          <p>
            Resistance signal detected. Microbiology review required.
            Illustrative time advantage ≈51 hours; actual time saved has not
            been measured.
          </p>
        </div>
      )}
      <div className="safety">
        Commitment to Safety: GenAMR is early clinical decision support.
        Conventional phenotypic AST remains the clinical confirmation.
        <br />
        <strong>
          Research demonstration only. S labels, probabilities and confidence
          scores below are simulated and must not guide patient treatment.
        </strong>
      </div>
      {(
        [
          "first_line",
          "second_line",
          "salvage_last_resort",
          "contraindicated",
        ] as const
      ).map((tier) => (
        <section className="card" key={tier}>
          <h3>
            {
              {
                first_line: "First-line targeted",
                second_line: "Second-line / increased exposure",
                salvage_last_resort: "Salvage / last-resort review",
                contraindicated: "Resistance signals",
              }[tier]
            }
          </h3>
          <div className="ast-list">
            {predictions
              .filter((p) => p.therapy_tier === tier)
              .map((p) => (
                <details
                  key={p.antibiotic_name}
                  className="ast-row"
                  data-testid={`drug-${p.antibiotic_name}`}
                >
                  <summary>
                    <span className={`sir ${p.predicted_sir}`}>
                      {p.predicted_sir}
                    </span>
                    <div>
                      <strong>{p.antibiotic_name}</strong>
                      <small>{p.drug_class}</small>
                    </div>
                    <span className="confidence">
                      {p.confidence_score}%<small>demo score</small>
                    </span>
                    <span className="probability">
                      <span style={{ width: `${p.ml_probability_r * 100}%` }} />
                    </span>
                    <span>⌄</span>
                  </summary>
                  <div className="evidence">
                    <strong>Genetic evidence & mechanism</strong>
                    <p>{p.genetic_evidence.join("; ")}</p>
                    <p>{p.stewardship_recommendation}</p>
                    <small>
                      {p.rule_source} · simulated P(R){" "}
                      {p.ml_probability_r.toFixed(3)}
                    </small>
                  </div>
                </details>
              ))}
          </div>
        </section>
      ))}
      <p className="muted">
        S = Susceptible; I = Susceptible, increased exposure; R = Resistant.
        These demo mappings do not apply EUCAST MIC breakpoints. Drug dosing,
        infection site, source control and patient factors are outside this
        prototype.
      </p>
    </>
  );
}
