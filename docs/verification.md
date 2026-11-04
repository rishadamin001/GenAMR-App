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

Vercel account metadata reported active Hobby billing. The connector returned 403 for the account's default workspace and explicitly requested its authorize_team_access flow. No deployment was created, so live smoke testing remains pending. No paid resources, external model services, cron jobs or upgrades were enabled.
