# Demo walkthrough

[← Project overview](../README.md) · [Documentation index](README.md) · [Open live demo](https://genamr-app.vercel.app)

All patients, assay results, scores and outcomes are synthetic. This walkthrough demonstrates software behavior, not clinical treatment decisions.

## Six featured scenarios

Select a case in the scenario controller, then move through Collect → qPCR → Decide → Sanger → Report.

| Case | Scenario | What to inspect |
| --- | --- | --- |
| GAMR-BD-001 | Fast-track MBL | Carbapenemase detection stops reflex sequencing; illustrative total ৳1,200 |
| GAMR-BD-002 | QRDR triple mutant | Reflex sequencing and mutation evidence; illustrative total ৳2,050 |
| GAMR-BD-003 | Wild-type / allele resolution | Targeted Sanger and changes in the illustrative report |
| GAMR-BD-004 | Dual carbapenemase | Multiple resistance markers in one sample |
| GAMR-BD-005 | Acinetobacter ICU | Organism-specific synthetic resistance profile |
| GAMR-BD-006 | Colistin resistance marker | mcr-1 evidence in the report and surveillance view |

## Interactive checks

1. **Compare routing:** switch between cases 001 and 002 and inspect the Decide screen and fee.
2. **Change a gene:** toggle mcr-1 positive in qPCR and inspect Colistin in the report.
3. **Change a mutation:** use the Sanger controls to toggle gyrA S83L and D87N, then inspect Ciprofloxacin.
4. **Reconcile AST:** open Validation, record synthetic confirmation results, and inspect the calculated metrics.
5. **Simulate a model update:** use the retraining control and observe the version and simulated weights. No real model training or measured accuracy improvement is implied.
6. **Export surveillance:** download CSV or JSON. These are planning exports, not certified WHO GLASS or IEDCR submission files.
7. **Print:** use the report's print control to preview a hospital-style report.

## Presentation tips

- Use the desktop view for lab curves and chromatograms, and mobile for the bedside workflow.
- Currency and language controls change presentation; persona selection does not grant permissions.
- Local changes persist in the current browser. Use synthetic data only, including in optional cloud mode.
- Explain the research limitation banner before showing illustrative susceptibility labels or probabilities.
