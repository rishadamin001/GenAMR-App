# GenAMR
### Rapid AMR workflow research demo for Bangladesh

GenAMR demonstrates how qPCR screening, selective Sanger sequencing, and an interpretation layer could support an antimicrobial resistance (AMR) testing workflow. Explore six interactive clinical archetypes and 60 historical synthetic isolates through a responsive lab and bedside interface.

**[Open the live demo](https://genamr-app.vercel.app)** · **[Demo walkthrough](docs/demo-guide.md)** · **[Documentation](docs/README.md)** · **[Contributing](CONTRIBUTING.md)**

> **Research demonstration — synthetic data only.** GenAMR is not a validated diagnostic service or treatment recommendation. Conventional phenotypic AST remains the clinical confirmation. Scores and retraining are deterministic simulations, not measured clinical performance.

## What you can explore

| Workflow | Interactive features |
| --- | --- |
| **1. Collect** | Synthetic sample intake, specimen label and collection timeline |
| **2. qPCR** | 40-cycle amplification curves, target toggles and Ct controls |
| **3. Decide** | Fast-track versus targeted-reflex routing, illustrative fees and turnaround |
| **4. Sanger** | Four-color canvas chromatograms and QRDR mutation toggles |
| **5. Report** | Empirical-therapy mismatch alerts, 16-drug illustrative matrix and printable report |
| **Validation** | Phenotypic AST reconciliation and simulated model-version updates |
| **Surveillance** | Eight-division synthetic summaries and CSV/JSON exports |

The app includes desktop and mobile layouts, English/Bangla key labels, BDT/USD pricing, persona controls, local persistence and an installable PWA. Visited assets become available offline after an initial online visit.

## Try the demo

1. Open the [live app](https://genamr-app.vercel.app) and choose a case in the scenario controller.
2. Compare **GAMR-BD-001** (fast track; ৳1,200) with **GAMR-BD-002** (Sanger reflex; ৳2,050).
3. Change a qPCR target or Sanger mutation and inspect the updated report.
4. Explore validation and surveillance using the synthetic records.

See the [six-case walkthrough](docs/demo-guide.md) for more examples.

## Run locally

Use Node.js 20.9 or newer; Node.js 24 is recommended.

```bash
git clone https://github.com/rishadamin001/GenAMR-App.git
cd GenAMR-App
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**. No environment variables, paid APIs or cloud account are needed for local mode.

For a production build:

```bash
npm run build
npm run start
```

## Technology and project layout

**Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Recharts · HTML5 Canvas · optional Supabase**

```text
src/
  app/                 Next.js pages, styles and PWA manifest
  components/          Workflow, layout, validation and surveillance UI
  lib/
    bioinformatics/    Deterministic qPCR, reflex, Sanger and interpretation engines
    data/              Local-first repository and optional cloud synchronization
    seed/              Synthetic Bangladesh AMR fixtures
public/                PWA assets
supabase/migrations/   Eight-table PostgreSQL schema and access policies
tests/                 Engine tests and desktop/mobile browser tests
docs/                  Guides, architecture, scope and verification evidence
```

## Data and deployment

The default store uses memory and browser localStorage. Optional Supabase integration uses authenticated, owner-scoped uploads; see the [data and scientific scope guide](docs/data-and-scientific-scope.md) and [backend plan](docs/backend-plan.md) before enabling it. Live Supabase synchronization and RLS checks have not been verified against a connected project.

The [live demo](https://genamr-app.vercel.app) runs on Vercel. The current deployment was uploaded directly; **GitHub pushes do not automatically deploy** until the Vercel GitHub integration is connected. Local mode requires no paid services, cron jobs or cloud add-ons. Provider free-tier limits and account billing settings still apply.

## Verification

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The latest recorded verification passed **10 engine tests** and **4 browser tests**, including desktop (1440 × 900) and mobile (390 × 844) flows. Live production smoke tests also passed. These are software checks, not evidence of diagnostic accuracy.

Read the [verification record](docs/verification.md) for results and limitations.

## Documentation

- [Documentation index](docs/README.md) — find the right guide
- [Demo walkthrough](docs/demo-guide.md) — six scenarios and interactive checks
- [Implementation scope](docs/implementation-scope.md) — implemented behavior and boundaries
- [Backend plan](docs/backend-plan.md) — schema, access model and synchronization
- [Data and scientific scope](docs/data-and-scientific-scope.md) — research limitations and cloud setup
- [Verification record](docs/verification.md) — build, test and deployment evidence
- [Contributing](CONTRIBUTING.md) — development and review expectations
