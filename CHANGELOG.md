# Open Agent Recorder - CHANGELOG

This document describes changes between versions of the Open Agent Recorder packages.

## Packages

- `@open-agent-recorder/core` - Core types and recorder primitives
- `@open-agent-recorder/node` - Node.js transport client
- `@open-agent-recorder/collector` - Local HTTP collector

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/). Minor versions are released on a regular basis and typically include new features, improvements, and bug fixes.

---

## Recent Changes

### v0.1.0 - Initial Release

#### Core Package (`@open-agent-recorder/core`)
- Initial trace event schema with support for model calls, tool calls, retrieval results, errors, and annotations
- Recorder primitives with configurable sinks
- Default redaction for API keys, bearer tokens, cookies, passwords, emails, and credential-like strings
- TypeScript strict typing

#### Node Package (`@open-agent-recorder/node`)
- Node.js collector sink using fetch API
- HTTP POST transport to local collector
- Configurable endpoint and fetch implementation

#### Collector (`@open-agent-recorder/collector`)
- Local HTTP server on port 4319
- JSONL persistent storage (`./data/events.jsonl`)
- Event APIs: `POST /v1/events`, `GET /v1/events`, `GET /v1/events?traceId=<id>`
- Trace APIs: `GET /v1/traces`, `GET /v1/traces/:traceId`
- Health check endpoint: `GET /health`

#### Examples
- `node-basic` - Minimal recording example
- `query-traces` - Query traces via HTTP API
- `inspect-jsonl` - Inspect persisted JSONL storage

---

## Full Changelog

See [GitHub Releases](https://github.com/safriyandi/open-agent-recorder/releases) for full commit history and release notes.
