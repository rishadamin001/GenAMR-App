export const primers = {
  gyrA: "F: CGC GTA CTA TAC GCC ATG AAC GTA · R: ACC GTT GAT CAC TTC GGT CAG G · 441 bp · 55°C",
  parC: "QRDR codons 76–86 · research primer validation pending",
  blaSHV: "F: CTT TAT CGG CCC TCA CTC AA · allele confirmation",
  blaTEM: "861 bp · allele confirmation",
};
export function simulateTrace(locus: "gyrA" | "parC", mutations: string[]) {
  const codons = Array.from(
    { length: 11 },
    (_, i) => ["GCT", "GGT", "ATC", "TCG"][i % 4],
  );
  const start = locus === "gyrA" ? 80 : 76;
  if (locus === "gyrA") {
    codons[3] = mutations.includes("S83L") ? "TTG" : "TCG";
    codons[7] = mutations.includes("D87N") ? "AAC" : "GAC";
  } else codons[4] = mutations.includes("S80I") ? "ATC" : "AGC";
  const sequence = codons.join("");
  const channels: Record<string, number[]> = { A: [], C: [], G: [], T: [] };
  for (const channel of "ACGT") {
    channels[channel] = Array.from({ length: sequence.length * 12 }, (_, x) => {
      let y = 3 + 2 * Math.sin(x * 0.27);
      for (let b = 0; b < sequence.length; b++)
        y +=
          (sequence[b] === channel ? 90 + ((b * 13) % 20) : 2) *
          Math.exp(-((x - (b * 12 + 6)) ** 2) / (2 * 2.1 ** 2));
      return y;
    });
  }
  return {
    sequence,
    codons,
    start,
    channels,
    quality: Array.from(sequence, (_, i) => 30 + ((i * 7) % 13)),
  };
}
