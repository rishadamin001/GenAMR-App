import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  simulateQpcr,
  classify,
  panel,
} from "@/lib/bioinformatics/qpcr-simulator";
import type { StageProps } from "./Stage1Collect";
const colors = [
  "#0d8b72",
  "#e65c50",
  "#df9d24",
  "#7375c9",
  "#317fca",
  "#b1609a",
];
export function Stage2Qpcr({ sample: s, update }: StageProps) {
  const [threshold, setThreshold] = useState(0.15);
  const entries = Object.entries(s.targets);
  return (
    <>
      <div className="two-col wide-left">
        <section className="card">
          <div className="section-label">02 / MULTIPLEX SCREENING</div>
          <h2>Amplification, made visible</h2>
          <p className="muted">
            40 thermal cycles · synthetic logistic fluorescence · Ct is an
            input, not a fitted threshold crossing
          </p>
          <div className="chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
              initialDimension={{ width: 600, height: 260 }}
            >
              <LineChart data={simulateQpcr(s.targets)}>
                <CartesianGrid strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 1.1]} width={35} tick={{ fontSize: 11 }} />
                <Tooltip />
                <ReferenceLine
                  y={threshold}
                  stroke="#b47820"
                  strokeDasharray="5 4"
                  label="τ"
                />
                {entries
                  .filter(([, ct]) => ct <= 38)
                  .map(([gene], i) => (
                    <Line
                      key={gene}
                      dataKey={gene}
                      type="monotone"
                      stroke={colors[i % colors.length]}
                      dot={false}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="curve-legend">
            {entries
              .filter(([, ct]) => ct <= 38)
              .map(([gene], i) => (
                <span key={gene} style={{ color: colors[i % colors.length] }}>
                  ● {gene}
                </span>
              ))}
          </div>
          <label>
            Display threshold τ = {threshold.toFixed(2)}
            <input
              type="range"
              min=".05"
              max=".6"
              step=".01"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </label>
          <div className="callout">
            Positive &lt;35 · Borderline 35–38 · Negative &gt;38. Adjusting the
            display threshold does not change the entered Ct.
          </div>
        </section>
        <section className="card">
          <div className="section-label">RUN QUALITY</div>
          <h2>96-well plate</h2>
          <div className="plate">
            {Array.from({ length: 96 }, (_, i) => (
              <span
                key={i}
                className={
                  i < entries.length && entries[i][1] < 35 ? "positive" : ""
                }
                title={`Well ${i + 1}`}
              />
            ))}
          </div>
          <label>
            Internal control Ct
            <input
              type="number"
              min="10"
              max="40"
              step=".1"
              value={s.internal_control_ct}
              onChange={(e) =>
                update({ internal_control_ct: Number(e.target.value) })
              }
            />
          </label>
          <p className="muted">
            {s.internal_control_ct > 35
              ? "QC FAIL • interpretation withheld"
              : "Internal control passed"}{" "}
            • synthetic melt peak 84.2°C
          </p>
          <details>
            <summary>Synthetic melt-curve Tm table</summary>
            <table>
              <thead>
                <tr>
                  <th>Target</th>
                  <th>Tm (°C)</th>
                </tr>
              </thead>
              <tbody>
                {entries
                  .filter(([, ct]) => ct < 35)
                  .map(([gene], i) => (
                    <tr key={gene}>
                      <td>{gene}</td>
                      <td>{(80 + i * 0.7).toFixed(1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <p>Illustrative peaks; assay-specific validation pending.</p>
          </details>
          <details>
            <summary>10 multiplex target groups</summary>
            <ul>
              {panel.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </details>
        </section>
      </div>
      <section className="card">
        <h2>
          Target calls <span className="pill">LIVE DEMO CONTROLS</span>
        </h2>
        <div className="target-grid">
          {entries.map(([gene, ct]) => (
            <div className="target" key={gene}>
              <label>
                <input
                  type="checkbox"
                  aria-label={`Toggle ${gene}`}
                  checked={ct < 35}
                  onChange={(e) =>
                    update({
                      targets: {
                        ...s.targets,
                        [gene]: e.target.checked ? 24 : 40,
                      },
                    })
                  }
                />
                <strong>{gene}</strong>
              </label>
              <span
                className={`badge ${ct < 35 ? "red" : ct <= 38 ? "amber" : "neutral"}`}
              >
                {classify(ct).replace("_INDETERMINATE", "")}
              </span>
              <label>
                Ct {ct.toFixed(1)}
                <input
                  aria-label={`${gene} Ct`}
                  type="range"
                  min="15"
                  max="40"
                  step=".1"
                  value={ct}
                  onChange={(e) =>
                    update({
                      targets: { ...s.targets, [gene]: Number(e.target.value) },
                    })
                  }
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
