# Contributing

Open Agent Recorder is intentionally small at the start. Contributions should improve production debugging, replay, privacy, or evaluation for AI agent systems.

## Good first areas

- framework adapters
- redaction rules
- replay fixtures
- trace visualizations
- model/provider cost calculators
- incident classification

## Development

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

## Contribution rules

- Keep APIs vendor-neutral.
- Redact sensitive data before storage.
- Prefer small, composable modules over large framework abstractions.
- Add tests for behavior changes.
- Do not introduce a new pattern when an existing package pattern already fits.
