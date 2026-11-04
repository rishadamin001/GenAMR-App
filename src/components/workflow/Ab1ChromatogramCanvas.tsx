import { useEffect, useRef } from "react";
import { simulateTrace } from "@/lib/bioinformatics/sanger-ab1-simulator";
export function Ab1ChromatogramCanvas({
  locus,
  mutations,
  zoom,
}: {
  locus: "gyrA" | "parC";
  mutations: string[];
  zoom: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const trace = simulateTrace(locus, mutations);
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
    const t = simulateTrace(locus, mutations),
      scale = width / (t.sequence.length * 12);
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
  }, [locus, mutations, zoom]);
  return (
    <>
      <div className="trace-scroll">
        <canvas
          ref={ref}
          aria-label={`${locus} synthetic four-color Sanger chromatogram`}
          role="img"
        />
      </div>
      <p className="mono">Sample: {trace.codons.join(" ")}</p>
      <p className="muted">
        Synthetic flanking sequence • A green / C blue / G charcoal / T red •
        Q30–Q42 • not an ABIF file parser
      </p>
    </>
  );
}
