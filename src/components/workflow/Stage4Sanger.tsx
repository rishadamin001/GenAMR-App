import { useState } from "react";
import { Ab1ChromatogramCanvas } from "./Ab1ChromatogramCanvas";
import { SangerReferenceComparison } from "./SangerReferenceComparison";
import { findReference } from "@/lib/bioinformatics/reference-comparison";
import { primers } from "@/lib/bioinformatics/sanger-ab1-simulator";
import { decide } from "@/lib/bioinformatics/reflex-decision-engine";
import type { StageProps } from "./Stage1Collect";
export function Stage4Sanger({ sample: s, update }: StageProps) {
  return <SangerWorkbench key={s.id} sample={s} update={update} />;
}
function SangerWorkbench({ sample: s, update }: StageProps) {
  const [locus, setLocus] = useState<"gyrA" | "parC">("gyrA");
  const [zoom, setZoom] = useState(1);
  const [selectedCodon, setSelectedCodon] = useState<number>();
  const parCReference = findReference(s.organism, "parC");
  const parCCodon = parCReference?.sequence.slice(12, 15) || "AGC";
  return (
    <div className="sanger-workspace">
      <section className="card">
        <div className="section-label">04 / TARGETED SEQUENCE RESOLUTION</div>
        <h2>One base can change the answer.</h2>
        {!decide(s).reflex && (
          <div className="callout">
            No sequencing ordered for this case. The viewer below is a research
            simulation only.
          </div>
        )}
        <div className="actions">
          <label>
            Target locus
            <select
              value={locus}
              onChange={(e) => {
                setLocus(e.target.value as "gyrA" | "parC");
                setSelectedCodon(undefined);
              }}
            >
              <option value="gyrA">gyrA QRDR · codons 80–90</option>
              <option value="parC">parC QRDR · codons 76–86</option>
            </select>
          </label>
          <label>
            Horizontal zoom
            <input
              type="range"
              min="1"
              max="3"
              step=".25"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
        </div>
        <p className="primer">{primers[locus]}</p>
        <Ab1ChromatogramCanvas
          locus={locus}
          mutations={s.mutations}
          zoom={zoom}
          organism={s.organism}
          selectedCodon={selectedCodon}
        />
        <div className="mutation-grid">
          {[
            ["S83L", "gyrA · codon 83", "TCG → TTG", "Serine → Leucine"],
            ["D87N", "gyrA · codon 87", "GAC → AAC", "Aspartate → Asparagine"],
            [
              "S80I",
              "parC · codon 80",
              `${parCCodon} → ${parCCodon === "AGT" ? "ATT" : "ATC"}`,
              "Serine → Isoleucine",
            ],
            [
              "G238S",
              "β-lactamase allele",
              "G238S",
              "ESBL-associated substitution",
            ],
          ].map(([mutation, title, codon, note]) => (
            <label className="mutation" key={mutation}>
              <input
                aria-label={`Toggle ${mutation}`}
                type="checkbox"
                checked={s.mutations.includes(mutation)}
                onChange={(e) =>
                  update({
                    mutations: e.target.checked
                      ? [...s.mutations, mutation]
                      : s.mutations.filter((m) => m !== mutation),
                  })
                }
              />
              <strong>
                {title} / {mutation}
              </strong>
              <code>{codon}</code>
              <small>{note}</small>
            </label>
          ))}
        </div>
        <div className="callout">
          Template codons: gyrA 83 TCG · gyrA 87 GAC · parC 80 {parCCodon}. SHV
          without G238S is a demo narrow-spectrum allele call, not full allele
          identification.
        </div>
      </section>
      <SangerReferenceComparison
        sample={s}
        locus={locus}
        selectedCodon={selectedCodon}
        onSelect={setSelectedCodon}
      />
    </div>
  );
}
