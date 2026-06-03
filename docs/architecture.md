# Architecture

Open Agent Recorder uses a simple event pipeline.

```text
LLM app / agent runtime
  -> SDK recorder
  -> redaction
  -> collector ingest API
  -> local JSONL storage
  -> replay / evaluation
```

## Packages

- `packages/core`: canonical event schema, redaction, and recorder behavior
- `packages/node`: Node.js transport client
- `apps/collector`: local collector API
- `examples/node-basic`: minimal SDK usage

## Event model

Events are grouped by `traceId`. A trace may contain model calls, tool calls, retrieval results, errors, and annotations. The schema is intentionally flat enough to persist as JSONL and flexible enough to support future storage backends.

The collector exposes both event-level and trace-level APIs:

- `POST /v1/events`: ingest one event
- `GET /v1/events`: list all events
- `GET /v1/events?traceId=<id>`: list events for one trace
- `GET /v1/traces`: list trace summaries
- `GET /v1/traces/:traceId`: inspect one trace

Trace summaries include event count, observed event kinds, first timestamp, and latest timestamp. This gives users a useful local inspection API before a dashboard exists.

## Privacy model

Redaction happens before persistence. SDK users can provide custom redaction rules, but the default redactor already masks common secrets, emails, API keys, bearer tokens, and long credential-like values.

For the MVP collector, accepted events are persisted locally as JSONL. This keeps traces easy to inspect, replay, and export while staying local-first by default.
