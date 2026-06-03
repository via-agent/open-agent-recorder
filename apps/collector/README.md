# @open-agent-recorder/collector

Local HTTP collector for Open Agent Recorder events.

## Usage

```bash
npx @open-agent-recorder/collector
```

Then send events:

```bash
curl -X POST http://localhost:4319/v1/events \
  -H "Content-Type: application/json" \
  -d '{"id":"e1","kind":"model.call","occurredAt":"...","schemaVersion":"...","trace":{"traceId":"t1"},"input":{"prompt":"hello"}}'
```

## API

- `POST /v1/events` - Submit an event
- `GET /v1/events` - List events
- `GET /v1/events?traceId=<id>` - Filter by trace
- `GET /v1/traces` - List trace summaries
- `GET /v1/traces/:traceId` - Get trace detail
- `GET /health` - Health check

## Storage

Events are persisted to `./data/events.jsonl` by default. Set `COLLECTOR_STORAGE_PATH` to change.

## License

Apache-2.0
