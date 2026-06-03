# @open-agent-recorder/node

Node.js transport client for Open Agent Recorder.

## Installation

```bash
npm install @open-agent-recorder/node @open-agent-recorder/core
```

## Usage

### Basic setup

```typescript
import { createRecorder } from "@open-agent-recorder/core";
import { createCollectorSink } from "@open-agent-recorder/node";

const recorder = createRecorder({
  sink: createCollectorSink()
});

await recorder.record({
  kind: "model.call",
  trace: {
    traceId: "trace_abc",
    userId: "user_123"
  },
  input: {
    prompt: "What is the capital of France?"
  },
  output: {
    text: "Paris"
  },
  metadata: {
    model: "gpt-4",
    provider: "openai",
    durationMs: 320,
    tokenInput: 12,
    tokenOutput: 5
  }
});
```

### Custom collector endpoint

```typescript
import { createCollectorSink } from "@open-agent-recorder/node";

const sink = createCollectorSink({
  endpoint: "http://localhost:8080/v1/events"
});
```

### With custom fetch implementation

```typescript
import { createCollectorSink } from "@open-agent-recorder/node";

const sink = createCollectorSink({
  fetchImpl: customFetch
});
```

`@open-agent-recorder/node` is designed to be used alongside `@open-agent-recorder/core`.

## API

### `createCollectorSink(options?)`

Creates a recorder sink that sends events to a collector via HTTP POST.

**Options:**

- `endpoint` (optional): collector URL, defaults to `http://localhost:4319/v1/events`
- `fetchImpl` (optional): custom fetch implementation, defaults to global `fetch`

**Returns:** `RecorderSink`

## License

Apache-2.0
