import snapshot from "../data/references/pointfinder-qrdr.json";

export type Locus = "gyrA" | "parC";
export const referenceDatabase = snapshot;
export type ReferenceRecord = (typeof snapshot.records)[number];

export function findReference(organism: string, locus: Locus) {
  // Only the explicit species supported by this snapshot; never match a genus alone.
  const species = organism
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim()
    .toLowerCase();
  return snapshot.records.find(
    (r) => r.species.toLowerCase() === species && r.locus === locus,
  );
}

const code = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
export function translateCodon(codon: string) {
  if (!/^[ACGT]{3}$/.test(codon)) return "?";
  const index = [...codon].reduce((n, b) => n * 4 + "TCAG".indexOf(b), 0);
  return code[index];
}

export function compareReference(sequence: string, reference: ReferenceRecord) {
  const sample = sequence.toUpperCase();
  if (
    sample.length !== reference.sequence.length ||
    !/^[ACGTN]+$/.test(sample)
  ) {
    return {
      status: "invalid" as const,
      message:
        "A 33-base, forward-oriented QRDR window is required. Gapped or unaligned reads are not supported.",
    };
  }
  const rows = Array.from({ length: sample.length / 3 }, (_, i) => {
    const position = reference.startCodon + i;
    const refCodon = reference.sequence.slice(i * 3, i * 3 + 3);
    const sampleCodon = sample.slice(i * 3, i * 3 + 3);
    const referenceAA = translateCodon(refCodon);
    const sampleAA = translateCodon(sampleCodon);
    const ambiguous = sampleCodon.includes("N");
    const changed = !ambiguous && refCodon !== sampleCodon;
    // PointFinder annotations are amino-acid rules, not alternate nucleotide alleles.
    const annotations = changed
      ? reference.annotations.filter(
          (a) =>
            a.position === position &&
            a.referenceAA === referenceAA &&
            a.alternateAA.includes(sampleAA),
        )
      : [];
    const kind = ambiguous
      ? "Unresolved"
      : !changed
        ? "Match"
        : sampleAA === referenceAA
          ? "Synonymous"
          : annotations.length
            ? "Catalogued substitution"
            : "Uncatalogued substitution";
    return {
      position,
      refCodon,
      sampleCodon,
      referenceAA,
      sampleAA,
      changed,
      ambiguous,
      annotations,
      kind,
      label: `${referenceAA}${position}${sampleAA}`,
      bases: [...sampleCodon].map((base, j) => ({
        base,
        reference: refCodon[j],
        position: (position - 1) * 3 + j + 1,
        changed: base !== "N" && base !== refCodon[j],
        ambiguous: base === "N",
      })),
    };
  });
  const comparedBases = [...sample].filter((b) => b !== "N").length;
  const differences = rows
    .flatMap((r) => r.bases)
    .filter((b) => b.changed).length;
  return {
    status: "compared" as const,
    rows,
    comparedBases,
    differences,
    identity: comparedBases
      ? (100 * (comparedBases - differences)) / comparedBases
      : null,
    unresolved: sample.length - comparedBases,
  };
}
