# Contributing to Open Agent Recorder

Thanks for your interest in contributing to Open Agent Recorder.

This project is an open source flight recorder for AI agents and LLM applications. The goal is to provide a vendor-neutral, local-first, privacy-aware trace format and tooling that helps teams debug, replay, and evaluate agent behavior.

## Development setup

Requirements:

- Node.js 20 or newer
- pnpm 9.x

Install dependencies:

```bash
pnpm install
```

Run the full validation suite:

```bash
pnpm check
pnpm test
pnpm build
```

Start the collector locally:

```bash
pnpm dev:collector
```

Run the basic example in another terminal:

```bash
pnpm example:node
```

## Repository layout

- `packages/core`: canonical event types, recorder primitives, and redaction logic
- `packages/node`: Node.js collector transport client
- `apps/collector`: local HTTP collector for trace events
- `examples`: runnable examples
- `docs`: architecture, roadmap, grants, and planning docs

## Contribution priorities

Good first areas to contribute:

- redaction rules and tests
- collector API improvements
- trace replay foundations
- provider SDK adapters
- examples and documentation
- evaluation utilities
- trace visualizations
- model/provider cost calculators
- incident classification

Please avoid adding large frameworks or storage backends unless there is an issue or design discussion first. The project intentionally keeps the MVP small, local-first, and easy to inspect.

## Coding style

- Use TypeScript and ES modules.
- Keep APIs small and composable.
- Prefer explicit exported interfaces for public contracts.
- Use two-space indentation.
- Keep tests deterministic.
- Do not make live model/API calls in unit tests.
- Keep redaction before persistence.
- Do not introduce a new pattern when an existing package pattern already fits.

## Testing

Add or update tests for behavior changes, especially:

- redaction behavior
- event schema changes
- recorder behavior
- transport failures
- collector persistence
- trace query behavior

Test files should live beside implementation files and use `*.test.ts`.

Before opening a PR, run:

```bash
pnpm check
pnpm test
pnpm build
```

## Privacy and security expectations

Never commit real secrets, API keys, bearer tokens, cookies, passwords, or private user data.

Fixtures and examples must use fake values only. If a test needs sensitive-looking data, use clearly fake values and assert that redaction removes them.

The collector is local-first by default. Any change that sends data to an external service must be explicit, documented, and opt-in.

## Pull request process

A good PR includes:

- a clear summary
- why the change is needed
- validation commands run
- linked issue or roadmap item when applicable
- screenshots or sample output for user-facing changes

Keep PRs focused. If a change touches unrelated areas, split it into multiple PRs.

## Commit messages

Use concise, descriptive commit messages in sentence case, for example:

```text
Add collector JSONL persistence
Improve redaction tests
Document trace API
```

## Questions and design discussions

For larger changes, open an issue first with:

- the problem being solved
- proposed API or behavior
- trade-offs considered
- migration impact, if any

This helps keep the project coherent as it grows.
