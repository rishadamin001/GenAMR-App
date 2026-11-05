# Contributing to GenAMR

[← Project overview](README.md) · [Documentation](docs/README.md)

GenAMR is a synthetic research demonstration. Keep contributions reproducible, local-first and free of paid API dependencies.

## Development

1. Follow the [local setup instructions](README.md#run-locally).
2. Create a focused branch and make a small, reviewable change.
3. Update relevant documentation and tests when behavior changes.
4. Open a pull request describing the problem, resulting behavior, verification and limitations.

For application changes, run:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Install Chromium once with `npx playwright install chromium`. Browser tests cover desktop and mobile; build before running the browser suite. Documentation-only changes should be checked for accurate claims and working repository links.

## Contribution boundaries

- Use synthetic records only. Do not commit real patient information, credentials, service-role keys or private hospital data.
- Keep simulations deterministic and label illustrative probabilities, confidence and model updates clearly.
- Do not describe absent resistance markers as clinical proof of susceptibility.
- Preserve the phenotypic AST confirmation notice and distinguish proposed collaboration from validated partnership claims.
- Document changes to clinical mappings with provenance and limitations; automated software tests do not establish clinical validity.
- Keep optional cloud behavior separate from the working local mode. Schema changes must preserve owner isolation and include a migration review.
- Avoid paid add-ons, external inference APIs and unnecessary scheduled jobs.

## Reporting a problem

Use [GitHub Issues](https://github.com/rishadamin001/GenAMR-App/issues) and include the scenario code, workflow stage, reproduction steps, expected result, actual result, and browser/device. Screenshots should contain synthetic information only. Never post credentials or patient data in a public issue.
