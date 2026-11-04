import { divisions } from "@/lib/seed/bangladesh-amr-seed";
import { interpret } from "@/lib/bioinformatics/interpretation-engine";
import type { Sample } from "@/lib/types";
import { Button } from "../ui/button";
export function NationalSurveillanceDashboard({
  samples,
  bengali,
}: {
  samples: Sample[];
  bengali: boolean;
}) {
  const rows = divisions.map((division) => {
    const cohort = samples.filter((s) => s.division === division);
    return {
      division,
      isolates: cohort.length,
      ceftriaxone_resistant: cohort.filter(
        (s) =>
          interpret(s).find((p) => p.antibiotic_name === "Ceftriaxone")
            ?.predicted_sir === "R",
      ).length,
      mcr1: cohort.filter((s) => s.targets["mcr-1"] < 35).length,
    };
  });
  function download(format: "csv" | "json") {
    const content =
      format === "json"
        ? JSON.stringify(
            { dataset: "SYNTHETIC DEMO — NOT OFFICIAL GLASS SUBMISSION", rows },
            null,
            2,
          )
        : "dataset,division,isolates,ceftriaxone_resistant,mcr1\n" +
          rows
            .map(
              (r) =>
                `SYNTHETIC,${r.division},${r.isolates},${r.ceftriaxone_resistant},${r.mcr1}`,
            )
            .join("\n");
    const url = URL.createObjectURL(
      new Blob([content], {
        type: format === "json" ? "application/json" : "text/csv",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `genamr-synthetic-surveillance.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <section className="card">
        <div className="section-label">BANGLADESH / 8 DIVISIONS</div>
        <h2>
          {bengali
            ? "জাতীয় অ্যান্টিমাইক্রোবিয়াল রেজিস্ট্যান্স নজরদারি"
            : "A national picture, one isolate at a time."}
        </h2>
        <p className="muted">
          66 deterministic synthetic isolates. Regional assignments illustrate
          referral catchments and do not represent hospital locations or
          epidemiological estimates.
        </p>
        <div className="division-grid">
          {rows.map((r) => (
            <article key={r.division} className="division">
              <div>
                <strong>{r.division}</strong>
                <span>{r.isolates} isolates</span>
              </div>
              <div
                className="heat"
                style={{
                  background: `linear-gradient(90deg,#e7a36f ${(r.ceftriaxone_resistant / r.isolates) * 100}%,#e7efec 0)`,
                }}
              />
              <p>
                {Math.round((r.ceftriaxone_resistant / r.isolates) * 100)}%
                ceftriaxone R <span>mcr-1: {r.mcr1}</span>
              </p>
            </article>
          ))}
        </div>
        <div className="actions">
          <Button onClick={() => download("csv")}>Export CSV</Button>
          <Button variant="outline" onClick={() => download("json")}>
            Export JSON
          </Button>
        </div>
        <p className="muted">
          WHO GLASS / IEDCR planning export. Not validated against an official
          submission schema.
        </p>
      </section>
      <section className="card">
        <h2>From validation to national scale</h2>
        <div className="roadmap">
          {[
            ["01", "Validate", "Proposed collaboration: dBme Research Group"],
            ["02", "Pilot", "Proposed partner: Asperia Healthcare Limited"],
            [
              "03",
              "National scale",
              "IEDCR-compatible reporting, subject to validation",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <small>PLANNED • NOT VERIFIED</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
