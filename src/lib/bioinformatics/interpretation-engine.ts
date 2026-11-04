import type { Sample, Prediction } from "../types";
export const antibiotics = [
  "Ampicillin",
  "Ceftriaxone",
  "Ceftazidime",
  "Cefepime",
  "Tigecycline",
  "Meropenem",
  "Imipenem",
  "Ertapenem",
  "Ciprofloxacin",
  "Levofloxacin",
  "Gentamicin",
  "Amikacin",
  "Co-trimoxazole",
  "Ceftazidime-Avibactam",
  "Ceftazidime-Avibactam + Aztreonam",
  "Colistin",
];
// Educational genotype mapping, NOT a validated EUCAST breakpoint implementation or fitted ML model.
export function interpret(s: Sample): Prediction[] {
  const p = (k: string) => (s.targets[k] ?? 40) < 35;
  const ndm = p("blaNDM"),
    carb = ndm || p("blaKPC") || p("blaOXA-48"),
    esbl =
      p("blaCTX-M") ||
      s.mutations.includes("G238S") ||
      s.mutations.includes("E240K"),
    ac = s.organism.includes("Acinetobacter");
  return antibiotics.map((name, i) => {
    let r = false;
    let evidence: string[] = [];
    const rule = (condition: boolean, why: string) => {
      if (condition) {
        r = true;
        evidence.push(why);
      }
    };
    if (i === 0)
      rule(
        esbl ||
          p("blaSHV") ||
          p("blaTEM") ||
          carb ||
          s.organism.includes("Klebsiella") ||
          ac,
        "β-lactamase / expected intrinsic phenotype",
      );
    if (i >= 1 && i <= 3)
      rule(esbl || carb || ac, "ESBL or carbapenemase β-lactam hydrolysis");
    if (i >= 5 && i <= 7)
      rule(
        carb || (ac && i === 7),
        "Carbapenemase / intrinsic ertapenem resistance",
      );
    if (i === 8 || i === 9)
      rule(
        s.mutations.includes("S83L") && s.mutations.includes("D87N"),
        "gyrA S83L + D87N; QRDR target modification",
      );
    if (i === 10 || i === 11)
      rule(
        p("rmtB") || p("armA") || (p("aadB") && i === 10),
        "Aminoglycoside modification / 16S methylation",
      );
    if (i === 12)
      rule(
        p("sul1") || p("dfrA"),
        "sul1 signal; trimethoprim mechanisms not excluded",
      );
    if (i === 13) rule(ndm || ac, "Ambler B MBL is not inhibited by avibactam");
    if (i === 14)
      rule(ac, "No validated combination inference for this species");
    if (i === 15) rule(p("mcr-1"), "mcr-1 phosphoethanolamine transferase");
    if (!r)
      evidence = [
        "No covered resistance mechanism detected; susceptibility is not established",
      ];
    const probability = r ? 0.991 : 0.15;
    return {
      antibiotic_name: name,
      drug_class:
        i === 4
          ? "Glycylcycline"
          : i < 5
            ? "β-lactam"
            : i < 8
              ? "Carbapenem"
              : i < 10
                ? "Fluoroquinolone"
                : i < 12
                  ? "Aminoglycoside"
                  : i === 12
                    ? "Folate antagonist"
                    : i < 15
                      ? "β-lactam combination"
                      : "Polymyxin",
      predicted_sir: r ? "R" : "S",
      confidence_score: r ? 99.1 : 85,
      ml_probability_r: probability,
      genetic_evidence: evidence,
      rule_source:
        "GenAMR demo rules v1 • EUCAST/CARD/ResFinder-inspired; not validated",
      stewardship_recommendation: r
        ? "Resistance signal: microbiologist review required."
        : "Illustrative S only. Confirm with phenotypic AST; do not select therapy from gene absence.",
      therapy_tier: r
        ? "contraindicated"
        : i >= 13 || i === 4
          ? "salvage_last_resort"
          : i >= 5 && i <= 7
            ? "second_line"
            : "first_line",
    };
  });
}
