# Open Agent Recorder

Open Agent Recorder is an open source flight recorder for AI agents and LLM applications.

It captures model calls, tool calls, retrieval context, latency, token usage, costs, and failures so teams can replay incidents, compare models, run evaluations, and debug production agent behavior without locking their traces into a closed vendor platform.

## Why this exists

AI agents fail in ways that are hard to reproduce:

- prompts change between releases
- tool calls depend on runtime state
- retrieval results drift
- model output is non-deterministic
- production logs often contain sensitive data
- replaying a failure across models is usually manual

Open Agent Recorder gives teams a neutral, privacy-aware trace format and local-first tooling for understanding what happened.

## MVP scope

This repository starts with a small, useful foundation:

- `@open-agent-recorder/core`: trace/event types, redaction, and recorder primitives
- `@open-agent-recorder/node`: Node.js client for sending traces to a collector
- `@open-agent-recorder/collector`: local HTTP collector for ingesting trace events
- `examples/node-basic`: minimal recording example

## Quick start

```bash
pnpm install
pnpm build
pnpm dev:collector
```

In another terminal:

```bash
pnpm example:node
```

The collector accepts events at:

```text
POST http://localhost:4319/v1/events
GET  http://localhost:4319/v1/events
GET  http://localhost:4319/health
```

## Project principles

- Local-first by default
- Vendor-neutral trace format
- Redaction before persistence
- Small SDK surface area
- Replay and evaluation support before dashboard complexity
- Enterprise-safe defaults, but useful for solo builders

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).

## Funding angle

This project is designed to be useful to companies building production AI systems and to qualify for open source AI credits or grants. See [docs/grants.md](docs/grants.md) for the positioning.

## License

Apache-2.0
