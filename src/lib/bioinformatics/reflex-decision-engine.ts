import type { Sample } from "../types";
export function decide(s: Sample) {
  const t = s.targets,
    positive = (k: string) => (t[k] ?? 40) < 35;
  const qc = s.internal_control_ct > 35 || s.internal_control_ct < 10;
  const borderline = Object.entries(t).some(
    ([k, v]) => k !== "16S rRNA" && v >= 35 && v <= 38,
  );
  const stop = ["blaNDM", "blaKPC", "blaOXA-48", "mcr-1"].some(positive);
  const loci: string[] = [];
  if (!stop && (positive("qnrS") || positive("qnrB") || s.step_down))
    loci.push("gyrA_QRDR", "parC_QRDR");
  if (!stop && !positive("blaCTX-M")) {
    if (positive("blaSHV")) loci.push("blaSHV_allele");
    if (positive("blaTEM")) loci.push("blaTEM_allele");
  }
  if (!stop && borderline) loci.push("borderline_verification");
  const reflex = !qc && loci.length > 0;
  return {
    qc,
    reflex,
    loci,
    fee: 1200 + (reflex ? 850 : 0),
    hours: reflex ? 4 : 2,
    reason: qc
      ? "QC failed. Repeat extraction and qPCR before interpretation."
      : stop
        ? "High-impact resistance marker detected. No routine sequencing add-on."
        : reflex
          ? "Resolve QRDR, allele identity or borderline target before final interpretation."
          : "No reflex trigger detected in this screening panel.",
    borderline,
  };
}
