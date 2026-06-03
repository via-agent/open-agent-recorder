import { createRecorder } from "@open-agent-recorder/core";
import { createCollectorSink } from "@open-agent-recorder/node";

const recorder = createRecorder({
  sink: createCollectorSink()
});

const trace = {
  environment: "local",
  release: "example",
  traceId: "trace_demo_001",
  userId: "user@example.com"
};

await recorder.record({
  input: {
    prompt: "Summarize the account for user@example.com",
    token: "sk-example-secret-key-1234567890abcdef"
  },
  kind: "model.call",
  metadata: {
    durationMs: 842,
    model: "gpt-4.1-mini",
    provider: "openai",
    tokenInput: 42,
    tokenOutput: 96
  },
  name: "support-summary",
  output: {
    text: "The account is active and has one unresolved support ticket."
  },
  trace
});

console.log("Recorded demo event");
