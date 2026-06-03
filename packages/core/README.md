# @open-agent-recorder/core

Core event types, recorder primitives, and redaction logic for Open Agent Recorder.

## Installation

```bash
npm install @open-agent-recorder/core
```

## Usage

### Record an event

```typescript
import { createRecorder } from "@open-agent-recorder/core";

const recorder = createRecorder({
  sink: {
    async write(event) {
      console.log("Event:", event);
    }
  }
});

await recorder.record({
  kind: "model.call",
  trace: {
    traceId: "trace_123"
  },
  input: {
    prompt: "Summarize this document",
    apiKey: "sk-secret-key-12345"
  },
  output: {
    text: "Summary text"
  },
  metadata: {
    model: "gpt-4",
    durationMs: 842,
    tokenInput: 42,
    tokenOutput: 96
  }
});
```

The recorder automatically redacts sensitive fields like `apiKey` before calling the sink.

### Custom redaction

```typescript
import { createRecorder, createDefaultRedactor } from "@open-agent-recorder/core";

const customRedactor = createDefaultRedactor([
  (value) => {
    // Add custom redaction rules
    if (typeof value === "string" && value.includes("internal-")) {
      return "[INTERNAL]";
    }
    return value;
  }
]);

const recorder = createRecorder({
  sink: yourSink,
  redactor: customRedactor
});
```

### Event types

All events share a common envelope:

```typescript
interface AgentEvent {
  id: string;
  kind: AgentEventKind;
  trace: TraceContext;
  occurredAt: string;
  schemaVersion: string;
  name?: string;
  input?: unknown;
  output?: unknown;
  metadata?: AgentEventMetadata;
}
```

Supported event kinds:

- `trace.started`
- `model.call`
- `tool.call`
- `retrieval.result`
- `annotation`
- `error`
- `trace.completed`

### Redaction

The default redactor masks:

- API keys
- Bearer tokens
- Cookies
- Passwords
- Emails
- Long credential-like strings

Redaction happens before persistence, ensuring sensitive data never reaches storage.

## License

Apache-2.0
