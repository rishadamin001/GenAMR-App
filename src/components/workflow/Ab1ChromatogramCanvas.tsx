import { useEffect, useRef } from "react";
import { simulateTrace } from "@/lib/bioinformatics/sanger-ab1-simulator";
import {
  findReference,
  compareReference,
} from "@/lib/bioinformatics/reference-comparison";
export function Ab1ChromatogramCanvas({
  locus,
  mutations,
  zoom,
  organism = "Escherichia coli",
  selectedCodon,
}: {
  locus: "gyrA" | "parC";
  mutations: string[];
  zoom: number;
  organism?: string;
  selectedCodon?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trace = simulateTrace(locus, mutations, organism);
  const reference = findReference(organism, locus);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const drawStarted = performance.now();
    const width = 792 * zoom,
      height = 240,
      ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fafcfc";
    ctx.fillRect(0, 0, width, height);
    const t = simulateTrace(locus, mutations, organism),
      scale = width / (t.sequence.length * 12);
    const record = findReference(organism, locus);
    const comparison = record && compareReference(t.sequence, record);
    if (comparison?.status === "compared") {
      comparison.rows.forEach((row, i) => {
        if (row.changed || row.position === selectedCodon) {
          ctx.fillStyle =
            row.position === selectedCodon ? "#ccece4" : "#fff0cc";
          ctx.fillRect(i * 36 * scale, 0, 36 * scale, height);
        }
      });
    }
    const colors: Record<string, string> = {
      A: "#10b981",
      C: "#3b82f6",
      G: "#1e293b",
      T: "#ef4444",
    };
    for (const channel of "ACGT") {
      ctx.strokeStyle = colors[channel];
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      t.channels[channel].forEach((v, i) => {
        const x = i * scale,
          y = 180 - v * 1.2;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke();
    }
    t.sequence.split("").forEach((base, i) => {
      ctx.fillStyle = colors[base];
      ctx.font = "bold 12px monospace";
      ctx.fillText(base, (i * 12 + 3) * scale, 28);
      ctx.fillStyle = "#c5e8dd";
      ctx.fillRect(
        (i * 12 + 2) * scale,
        220 - t.quality[i],
        7 * scale,
        t.quality[i],
      );
    });
    ctx.fillStyle = "#61726e";
    ctx.font = "11px monospace";
    t.codons.forEach((_, i) =>
      ctx.fillText(String(t.start + i), (i * 36 + 7) * scale, 53),
    );
    performance.measure("genamr-canvas-draw", {
      start: drawStarted,
      end: performance.now(),
    });
  }, [locus, mutations, zoom, organism, selectedCodon]);
  useEffect(() => {
    if (selectedCodon === undefined || !scrollRef.current) return;
    const x = ((selectedCodon - trace.start + 0.5) / 11) * 792 * zoom;
    scrollRef.current.scrollLeft = Math.max(
      0,
      x - scrollRef.current.clientWidth / 2,
    );
  }, [selectedCodon, trace.start, zoom]);
  return (
    <>
      <div
        className="trace-scroll"
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Scrollable Sanger trace"
      >
        <canvas
          ref={ref}
          aria-label={`${locus} synthetic four-color Sanger chromatogram`}
          role="img"
        />
      </div>
      <p className="mono">Sample: {trace.codons.join(" ")}</p>
      <p className="muted">
        {reference
          ? `Synthetic trace · PointFinder ${reference.accession} template`
          : "Synthetic flanking sequence · no species-matched reference"}{" "}
        • A green / C blue / G charcoal / T red • Q30–Q42 • not an ABIF file
        parser
      </p>
      {selectedCodon !== undefined && (
        <p className="trace-selection" role="status">
          Inspecting {locus} codon {selectedCodon} ·{" "}
          {trace.codons[selectedCodon - trace.start]} · highlighted in teal
        </p>
      )}
    </>
  );
}
