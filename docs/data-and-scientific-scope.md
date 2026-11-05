# Data and scientific scope

[← Project overview](../README.md) · [Documentation index](README.md)

## Scientific scope

**Synthetic research demo only; not a validated diagnostic service, clinical model, or treatment recommendation.** No calibrated ML model is claimed. S labels reflect illustrative scenario mappings, not proof of susceptibility from absence of a resistance gene. Confirm with phenotypic AST. No measured confidence, reduction in error rates, mortality impact, partnership validation or exact turnaround benefit is claimed. The app intentionally does not reproduce unsupported claims of validation, national epidemiological estimates, or treatment safety. The displayed primers and flanking sequences are not a laboratory protocol. Chromatograms are generated arrays, not real ABIF file decoding.

Sources for future expert curation: [EUCAST expert rules](https://www.eucast.org/bacteria/important-additional-information/expert-rules/), [CARD](https://card.mcmaster.ca/), [ResFinder](https://github.com/genomicepidemiology/resfinder). The prototype is not a complete implementation of EUCAST v13.1, CARD, ResFinder or PointFinder. Colistin, combination therapy, infection-site restrictions and organism-specific breakpoints require specialist review.

## Data and cloud boundary

`src/lib/data/genamr-store.ts` works with memory and localStorage without configuration. Optional `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` enable authenticated, owner-scoped normalized record uploads and a restorable snapshot via `ml_model_versions`. No secret/service-role keys belong in the browser. The eight normalized tables are supplied in `supabase/migrations/20261104000001_genamr_schema.sql`; the optional connection form signs in an existing research account and uploads synthetic records. The Sync status control retries uploads. A cloud snapshot is published only after all normalized batches succeed; uploads are idempotent, but not a cross-table transaction. Live cloud verification requires a configured project.

Anonymous visitors can only read reference tables. Signed-in owners can read/insert/update their own samples, child assays and model snapshots. Delete privileges are withheld; owner changes fail RLS checks. No hospital-wide sharing is implied by the persona selector. Migration is additive for a fresh project; inspect drift before applying to an existing database. Roll back the app independently; preserve data and use a forward migration for schema correction rather than destructive reset. Live RLS tests are required before enabling cloud writes for a real deployment.


## Export boundary

CSV/JSON exports are synthetic planning exports, not certified WHO GLASS/IEDCR submission formats.
