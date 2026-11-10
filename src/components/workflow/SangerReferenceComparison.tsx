import { useState } from "react";
import { Database, Download, ExternalLink } from "lucide-react";
import {
  compareReference,
  findReference,
  referenceDatabase,
  type Locus,
} from "@/lib/bioinformatics/reference-comparison";
import { simulateTrace } from "@/lib/bioinformatics/sanger-ab1-simulator";
import type { Sample } from "@/lib/types";

export function SangerReferenceComparison({
  sample,
  locus,
  selectedCodon,
  onSelect,
}: {
  sample: Sample;
  locus: Locus;
  selectedCodon?: number;
  onSelect: (position: number) => void;
}) {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const reference = findReference(sample.organism, locus);
  const trace = simulateTrace(locus, sample.mutations, sample.organism);
  const result = reference && compareReference(trace.sequence, reference);
  const source =
    reference && `${referenceDatabase.source}/${reference.sourcePath}`;
  function download() {
    if (!reference || result?.status !== "compared") return;
    const payload = {
      sampleCode: sample.sample_code,
      organism: sample.organism,
      locus,
      synthetic: true,
      method:
        "Ungapped, coordinate-matched 33-base QRDR window; not a whole-gene search",
      database: referenceDatabase.database,
      revision: referenceDatabase.revision,
      retrievedOn: referenceDatabase.retrievedOn,
      accession: reference.accession,
      referenceSource: source,
      referenceSequence: reference.sequence,
      sampleSequence: trace.sequence,
      ...result,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sample.sample_code}-${locus}-comparison.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <aside
      className="card reference-panel"
      aria-label="Sanger database comparison"
    >
      <div className="section-label">
        <Database size={14} /> REFERENCE INTELLIGENCE
      </div>
      <h2>Compare with database</h2>
      <p>
        Sample bases beside a species-matched reference. Differences update as
        you change mutations.
      </p>
      <div className="reference-source">
        <strong>
          PointFinder <span className="pill">LOCAL SNAPSHOT</span>
        </strong>
        <small>
          Retrieved {referenceDatabase.retrievedOn} · revision{" "}
          {referenceDatabase.revision.slice(0, 7)}
        </small>
        <small>4 reference windows · 2 species · available offline</small>
      </div>
      {!reference ? (
        <div className="callout" role="status">
          <strong>No reference available for {sample.organism}.</strong>
          <p>
            This snapshot covers Escherichia coli and Klebsiella pneumoniae
            only. No comparison or match score is reported for this species.
          </p>
        </div>
      ) : result?.status === "compared" ? (
        <>
          <div className="reference-record">
            <strong>
              {reference.species} · {locus}
            </strong>
            <a href={source} target="_blank" rel="noreferrer">
              {reference.accession} <ExternalLink size={12} /> Source sequence
            </a>
            <small>
              Forward coding strand · codons {reference.startCodon}–
              {reference.startCodon + 10} · 33 bases only
            </small>
          </div>
          <div
            className="reference-metrics"
            role="status"
            aria-live="polite"
            data-testid="reference-summary"
          >
            <div>
              <strong>{result.differences}</strong>
              <small>base differences</small>
            </div>
            <div>
              <strong>
                {result.identity === null
                  ? "—"
                  : `${result.identity.toFixed(1)}%`}
              </strong>
              <small>window identity</small>
            </div>
            <div>
              <strong>{result.comparedBases}/33</strong>
              <small>bases compared</small>
            </div>
          </div>
          <div
            className="alignment-scroll"
            tabIndex={0}
            role="region"
            aria-label="Reference and sample base alignment"
          >
            <table className="base-alignment">
              <caption>
                Amber + underline = changed base · ? = unresolved
              </caption>
              <thead>
                <tr>
                  <th scope="col">Codon</th>
                  {result.rows.map((r) => (
                    <th scope="col" key={r.position}>
                      {r.position}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Ref</th>
                  {result.rows.map((r) => (
                    <td key={r.position}>
                      <code>{r.refCodon}</code>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Sample</th>
                  {result.rows.map((r) => (
                    <td
                      key={r.position}
                      className={
                        selectedCodon === r.position ? "focused-codon" : ""
                      }
                    >
                      <button
                        aria-label={`Inspect codon ${r.position}: ${r.refCodon} to ${r.sampleCodon}, ${r.kind}`}
                        aria-pressed={selectedCodon === r.position}
                        onClick={() => onSelect(r.position)}
                      >
                        {r.bases.map((b) => (
                          <span
                            key={b.position}
                            className={
                              b.changed
                                ? "base-difference"
                                : b.ambiguous
                                  ? "base-unresolved"
                                  : ""
                            }
                            title={`Coding base ${b.position}: ${b.reference} → ${b.base}`}
                          >
                            {b.base}
                          </span>
                        ))}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="reference-note">
            Identity describes this short window, not a whole-gene match or
            susceptibility.
          </p>
          <label className="difference-filter">
            <input
              type="checkbox"
              checked={differencesOnly}
              onChange={(e) => setDifferencesOnly(e.target.checked)}
            />{" "}
            Show differences only
          </label>
          <div className="codon-results" aria-label="Codon comparison results">
            {result.rows
              .filter((r) => !differencesOnly || r.changed || r.ambiguous)
              .map((r) => (
                <details
                  key={r.position}
                  className={r.changed ? "codon-difference" : ""}
                >
                  <summary>
                    <strong>
                      {r.changed ? r.label : `Codon ${r.position}`}
                    </strong>
                    <code>
                      {r.refCodon} → {r.sampleCodon}
                    </code>
                    <small>{r.kind}</small>
                  </summary>
                  <p>
                    {r.referenceAA} → {r.sampleAA} · coding bases{" "}
                    {(r.position - 1) * 3 + 1}–{r.position * 3}
                  </p>
                  <button
                    className="reference-jump"
                    onClick={() => onSelect(r.position)}
                  >
                    Locate codon {r.position} in trace
                  </button>
                  {r.annotations.length ? (
                    <>
                      <p>
                        PointFinder lists this amino-acid substitution. This is
                        a catalogue match, not a clinical resistance
                        determination.
                      </p>
                      {[
                        ...new Set(
                          r.annotations.map((a) => a.note).filter(Boolean),
                        ),
                      ].map((note) => (
                        <p key={note}>{note}</p>
                      ))}
                      {r.annotations.some((a) => a.requires) && (
                        <p>
                          Some entries require additional mutations. Review the
                          source rules and confirm with phenotypic AST.
                        </p>
                      )}
                      {r.annotations.some(
                        (a) => a.referenceCodon !== r.refCodon,
                      ) && (
                        <p>
                          The source annotation uses a different synonymous
                          reference codon; matching here is at the amino-acid
                          level.
                        </p>
                      )}
                      <a
                        href={`${referenceDatabase.source}/${reference.annotationPath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Review database annotations <ExternalLink size={12} />
                      </a>
                    </>
                  ) : (
                    <p>
                      {r.ambiguous
                        ? "Unresolved bases are excluded from identity. No amino-acid call is made."
                        : r.changed
                          ? "No matching amino-acid substitution in this bundled subset. This does not establish clinical significance."
                          : "Matches this reference codon. A match does not establish susceptibility."}
                    </p>
                  )}
                </details>
              ))}
            {differencesOnly &&
              result.differences === 0 &&
              result.unresolved === 0 && (
                <p className="callout">
                  No differences in this 33-base window.
                </p>
              )}
          </div>
          <button className="reference-export" onClick={download}>
            <Download size={14} /> Export comparison JSON
          </button>
        </>
      ) : (
        <div className="callout">
          {result?.message || "Comparison unavailable"}
        </div>
      )}
      <p className="reference-note">
        Synthetic sample on a sourced reference template. This is an offline
        database subset, not a live search, BLAST alignment or uploaded .ab1
        analysis. No sample is sent to an external service.
      </p>
    </aside>
  );
}
