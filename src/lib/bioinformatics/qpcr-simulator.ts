export function classify(ct: number) {
  return ct < 35
    ? "POSITIVE"
    : ct <= 38
      ? "BORDERLINE_INDETERMINATE"
      : "NEGATIVE";
}
export function simulateQpcr(targets: Record<string, number>) {
  return Array.from({ length: 40 }, (_, i) => {
    const cycle = i + 1;
    return {
      cycle,
      ...Object.fromEntries(
        Object.entries(targets).map(([gene, ct], j) => [
          gene,
          ct > 38
            ? 0.025 + 0.003 * Math.sin(cycle + j)
            : 0.025 +
              0.975 / (1 + Math.exp(-0.85 * (cycle - ct))) +
              0.003 * Math.sin(cycle * 2 + j),
        ]),
      ),
    };
  });
}
export const panel = [
  "16S rRNA + species",
  "blaNDM-1/5",
  "blaOXA-48/181/232",
  "blaKPC-2",
  "blaCTX-M-15/9",
  "blaSHV / blaTEM",
  "qnrB/qnrS + aac(6′)-Ib-cr",
  "rmtB/armA/aadB",
  "sul1/dfrA",
  "mcr-1",
];
