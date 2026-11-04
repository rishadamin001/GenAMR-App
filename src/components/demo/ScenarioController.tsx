import type { Sample } from "@/lib/types";
export function ScenarioController({
  samples,
  selected,
  onSelect,
}: {
  samples: Sample[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <details className="scenario no-print">
      <summary>⚡ Instant Demo Scenario Controller</summary>
      <div className="scenario-grid">
        {samples.slice(0, 6).map((s, i) => (
          <button
            key={s.id}
            aria-pressed={selected === s.id}
            onClick={() => onSelect(s.id)}
          >
            <span>0{i + 1}</span>
            <strong>{s.title}</strong>
            <small>{s.sample_code}</small>
          </button>
        ))}
      </div>
      <p>
        Synthetic cases • gene and mutation controls are available in qPCR and
        Sanger.
      </p>
    </details>
  );
}
