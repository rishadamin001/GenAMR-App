import type { Confirmation, SIR } from "../types";
export function concordance(p: SIR, a: SIR) {
  return p === a
    ? p === "R"
      ? "true_positive"
      : "true_negative"
    : p === "I" || a === "I"
      ? "minor_error"
      : p === "R"
        ? "major_error_ME"
        : "very_major_error_VME";
}
export function metrics(rows: Confirmation[]) {
  const binary = rows.filter(
    (r) => r.confirmed_sir !== "I" && r.predicted_sir !== "I",
  );
  const resistant = binary.filter((r) => r.confirmed_sir === "R"),
    susceptible = binary.filter((r) => r.confirmed_sir === "S");
  const me = susceptible.filter((r) => r.predicted_sir === "R").length,
    vme = resistant.filter((r) => r.predicted_sir === "S").length;
  return {
    n: rows.length,
    me: susceptible.length ? (me / susceptible.length) * 100 : null,
    vme: resistant.length ? (vme / resistant.length) * 100 : null,
    bacc:
      resistant.length && susceptible.length
        ? (100 * (1 - vme / resistant.length + 1 - me / susceptible.length)) / 2
        : null,
  };
}
