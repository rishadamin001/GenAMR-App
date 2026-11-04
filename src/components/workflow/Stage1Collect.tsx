import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import type { Sample } from "@/lib/types";
import { hospitals } from "@/lib/seed/bangladesh-amr-seed";
import { antibiotics } from "@/lib/bioinformatics/interpretation-engine";
import { Button } from "../ui/button";
export type StageProps = {
  sample: Sample;
  update: (patch: Partial<Sample>) => void;
};
export function Stage1Collect({ sample: s, update }: StageProps) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="two-col">
      <section className="card">
        <div className="section-label">01 / PRE-ANALYTICAL</div>
        <h2>Register a specimen</h2>
        <p className="muted">
          Use synthetic aliases only. This prototype is not a patient record
          system.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ collected_at: new Date().toISOString() });
            setSaved(true);
          }}
        >
          <div className="form-grid">
            <label>
              Partner hospital
              <select
                value={s.hospital_id}
                onChange={(e) =>
                  update({
                    hospital_id: e.target.value,
                    division: hospitals.find((h) => h.id === e.target.value)!
                      .division,
                  })
                }
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Patient alias
              <input
                value={s.patient_alias}
                onChange={(e) => update({ patient_alias: e.target.value })}
                required
                maxLength={60}
              />
            </label>
            <label>
              Age
              <input
                type="number"
                min="0"
                max="120"
                value={s.patient_age}
                onChange={(e) =>
                  update({ patient_age: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Specimen
              <select
                value={s.specimen_type}
                onChange={(e) => update({ specimen_type: e.target.value })}
              >
                {[
                  "blood",
                  "endotracheal_aspirate",
                  "urine",
                  "sputum",
                  "wound_swab",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Empirical antibiotic
              <select
                value={s.empirical_drug}
                onChange={(e) => update({ empirical_drug: e.target.value })}
              >
                {antibiotics.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <label>
              Ward
              <input
                value={s.ward_unit}
                onChange={(e) => update({ ward_unit: e.target.value })}
              />
            </label>
          </div>
          <div className="actions">
            <Button type="submit">Register collection</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                update({
                  patient_alias: `Synthetic ICU ${s.sample_code.slice(-3)}`,
                  patient_age: 30 + (Number(s.sample_code.slice(-3)) % 60),
                })
              }
            >
              Generate synthetic patient
            </Button>
          </div>
          {saved && <p role="status">Collection registered on this device.</p>}
        </form>
      </section>
      <section className="card">
        <div className="section-label">SPECIMEN PASSPORT</div>
        <h2>{s.sample_code}</h2>
        <QRCodeSVG
          value={JSON.stringify({
            sample: s.sample_code,
            specimen: s.specimen_type,
            synthetic: true,
          })}
          title="Synthetic specimen QR label"
          size={160}
          marginSize={2}
        />
        <p className="muted">
          Scannable synthetic specimen QR •{" "}
          {s.specimen_type.replaceAll("_", " ")}
        </p>
        <ol className="timeline">
          <li>
            <strong>Collected at bedside</strong>
            <span>Label and specimen integrity check</span>
          </li>
          <li>
            <strong>Courier handover</strong>
            <span>Demonstration custody checkpoint</span>
          </li>
          <li>
            <strong>Molecular lab received</strong>
            <span>Extraction → internal control → amplification</span>
          </li>
        </ol>
        <div className="callout">
          Target screening SLA <strong>2 hours</strong>
          <br />
          Countdown starts after collection registration.
        </div>
      </section>
    </div>
  );
}
