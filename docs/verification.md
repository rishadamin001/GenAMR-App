# Verification — 4 November 2026

## Results
- TypeScript strict check: passed (`npm run typecheck`).
- Production build: passed (`npm run build`), Next.js 16.4.5; app and manifest prerendered.
- Engine/data tests: 10 passed (`npm test`), including Ct boundaries, case fees, QC hold, Colistin/QRDR effects, damaged-store rejection and reference-class metric denominators.
- Chromium browser checks: 4 passed (`npm run test:e2e`). Desktop 1440×900 and mobile emulation 390×844 independently verified workflow navigation, fee changes, mcr-1 → Colistin R, dual gyrA mutation → Ciprofloxacin R, batch model-version update, collection registration, surveillance CSV, no horizontal overflow, currency/Bengali toggles, offline reload, mutation persistence and print safety content.
- Application exceptions and asserted workflow console errors: none observed. Test-runner color-environment warnings are unrelated to application behavior.
- Production dependency audit: 0 vulnerabilities (`npm audit --omit=dev --audit-level=moderate`).
- Diff whitespace check: passed. Source formatted with Prettier.

## Local performance observations
Unthrottled local Chromium, not a field or physical-device benchmark. Desktop initial FCP/LCP 252 ms, CLS approximately 0.000001. Mobile-emulation FCP/LCP 172 ms, CLS 0. Canvas draw durations 1.2–8.9 ms desktop and 1.3–10.8 ms mobile emulation. Browser-control interaction round trips include automation and two animation frames and are not INP. INP, Lighthouse scoring, real-device 60fps, and production network performance were not measured. Approximately 324 KB of script and stylesheet transfer was observed. No paid analytics were added.

## Review fixes
- Added an explicit readiness marker for tests rather than relying on hidden/composite status text.
- Corrected the seed target union type and supplied chart initial dimensions.
- Updated Next.js within major 16 after registry advisories identified newer security patches than Context7's version catalog.
- Prevented a fresh browser's seed state from automatically overwriting a cloud snapshot.
- Serialized optional cloud writes and validated restored local/cloud payloads.
- Metric assertions use a tight numerical tolerance for floating-point arithmetic, not rounded display values.

## Remaining verification boundaries
No connected Supabase projects were available. The migration, RLS and optional cloud sync have not been exercised against a live database. No clinical performance, partnership, prevalence, susceptibility, or calibrated ML claim is validated. Normalized cloud uploads are retryable batches, not an atomic clinical publication mechanism. See backend-plan.md and implementation-scope.md.

## Production deployment and live verification — 5 November 2026 (Asia/Dhaka)

The Vercel workspace grant was completed. Production is READY at https://genamr-app.vercel.app, deployment `dpl_SJZMTLk79Gp792t74dWp7ZnXmUxZ`. The deployed application source is commit `56ac75e373118a10f2ab82b1149242601bc4e070`. Vercel built the source successfully in approximately 25 seconds, with a non-blocking build-tool module deprecation warning.

All four Playwright browser tests passed against the production URL (24.3 seconds total), independently covering desktop 1440×900 and mobile emulation 390×844. Verified collection, qPCR, decision routing, Sanger mutations, report updates, surveillance CSV, synthetic validation/retraining, offline reload, persisted mutations, currency/Bengali controls, print safety content and no horizontal overflow. Workflow console-error and page-exception assertions passed. Desktop qPCR and mobile Sanger screenshots were visually inspected. The production alias was confirmed to resolve to the tested deployment. A Vercel error/fatal runtime-log query returned no matching records; this static application's client-side diagnostics are the more relevant evidence.

Deployment used direct source upload because the workspace does not have Vercel's GitHub integration installed. Future GitHub pushes therefore do not automatically deploy. The app runs in local-storage mode without Supabase credentials. Live Supabase/RLS and clinical validation remain pending. Vercel account metadata reported active Hobby billing; no paid resources, external model services, cron jobs or upgrades were enabled.