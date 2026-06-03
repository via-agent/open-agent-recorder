# Architecture

Open Agent Recorder uses a simple event pipeline.

```text
LLM app / agent runtime
  -> SDK recorder
  -> redaction
  -> collector ingest API
  -> storage / replay / evaluation
```

## Packages

- `packages/core`: canonical event schema, redaction, and recorder behavior
- `packages/node`: Node.js transport client
- `apps/collector`: local collector API
- `examples/node-basic`: minimal SDK usage

## Event model

Events are grouped by `traceId`. A trace may contain model calls, tool calls, retrieval results, errors, and annotations. The schema is intentionally flat enough to export to JSONL and flexible enough to support future storage backends.

## Privacy model

Redaction happens before persistence. SDK users can provide custom redaction rules, but the default redactor already masks common secrets, emails, API keys, bearer tokens, and long credential-like values.
