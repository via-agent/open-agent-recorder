# Open Agent Recorder

[![npm version](https://img.shields.io/npm/v/@open-agent-recorder/core?style=flat-square&logo=npm)](https://www.npmjs.com/package/@open-agent-recorder/core)
[![npm version](https://img.shields.io/npm/v/@open-agent-recorder/node?style=flat-square&logo=npm)](https://www.npmjs.com/package/@open-agent-recorder/node)
[![CI](https://img.shields.io/github/actions/workflow/status/safriyandi/open-agent-recorder/ci.yml?style=flat-square&logo=github)](https://github.com/safriyandi/open-agent-recorder/actions)
[![GitHub license](https://img.shields.io/github/license/safriyandi/open-agent-recorder?style=flat-square&logo=apache)](https://github.com/safriyandi/open-agent-recorder/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/safriyandi/open-agent-recorder?style=flat-square&logo=github)](https://github.com/safriyandi/open-agent-recorder/stargazers)

> An open source flight recorder for AI agents and LLM applications

Open Agent Recorder captures model calls, tool calls, retrieval context, latency, token usage, costs, and failures so teams can replay incidents, compare models, run evaluations, and debug production agent behavior without locking their traces into a closed vendor platform.

---

## Why this exists

AI agents fail in ways that are hard to reproduce:

- prompts change between releases
- tool calls depend on runtime state
- retrieval results drift
- model output is non-deterministic
- production logs often contain sensitive data
- replaying a failure across models is usually manual

Open Agent Recorder gives teams a **neutral, privacy-aware trace format** and **local-first tooling** for understanding what happened.

---

## Quick start

```bash
npm install @open-agent-recorder/core @open-agent-recorder/node
```

```typescript
import { createRecorder } from "@open-agent-recorder/core";
import { createCollectorSink } from "@open-agent-recorder/node";

const recorder = createRecorder({
  sink: createCollectorSink()
});

await recorder.record({
  kind: "model.call",
  trace: { traceId: "my-trace-123" },
  input: { prompt: "Summarize this" },
  output: { text: "Summary here" },
  metadata: { model: "gpt-4", durationMs: 320 }
});
```

Start the collector locally:

```bash
npx @open-agent-recorder/collector
```

---

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@open-agent-recorder/core` | [![core-version](https://img.shields.io/npm/v/@open-agent-recorder/core)](https://npm.im/@open-agent-recorder/core) | Trace/event types, redaction, and recorder primitives |
| `@open-agent-recorder/node` | [![node-version](https://img.shields.io/npm/v/@open-agent-recorder/node)](https://npm.im/@open-agent-recorder/node) | Node.js client for sending traces to a collector |
| `@open-agent-recorder/collector` | [![collector-version](https://img.shields.io/npm/v/@open-agent-recorder/collector)](https://npm.im/@open-agent-recorder/collector) | Local HTTP collector for ingesting trace events |

---

## Features

- ✅ **Local-first** - Data stays on your machine by default
- ✅ **Privacy-aware** - Redaction happens before persistence
- ✅ **Vendor-neutral** - No lock-in to a specific platform
- ✅ **JSONL format** - Human-readable, easy to inspect and process
- ✅ **Type-safe** - Full TypeScript support with strict typing
- ✅ **Replay-ready** - Capture full context for incident reproduction

---

## Collector API

### POST /v1/events
Submit a single agent event. The collector validates the event shape, applies redaction to `input`, `output`, and `metadata` fields, then persists the event to local storage.

**Request body:** `AgentEvent` JSON object

**Response:** `202 Accepted` with `{ accepted: true, id: string, traceId: string }`

### GET /v1/events
List all events, optionally filtered by `traceId` query parameter.

**Query params:**
- `traceId` (optional): filter events by trace ID

**Response:** `{ events: AgentEvent[] }`

### GET /v1/traces
List all traces with summary metadata (event count, kinds, start/end timestamps).

**Response:** `{ traces: TraceSummary[] }` sorted by most recent activity

### GET /v1/traces/:traceId
Retrieve all events for a single trace along with trace summary.

**Response:** `{ events: AgentEvent[], trace: TraceSummary }`

**Error:** `404` if trace does not exist

---

## Examples

See the [examples](examples) directory for:

- `node-basic` - Minimal recording example
- `query-traces` - Query traces via HTTP API
- `inspect-jsonl` - Inspect persisted JSONL storage directly

---

## Project principles

- **Local-first by default**
- **Vendor-neutral trace format**
- **Redaction before persistence**
- **Small SDK surface area**
- **Replay and evaluation support before dashboard complexity**
- **Enterprise-safe defaults, but useful for solo builders**

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and PR process.

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) for the current roadmap and milestones.

---

## License

Apache-2.0 © [Safriyandi](https://github.com/safriyandi)
