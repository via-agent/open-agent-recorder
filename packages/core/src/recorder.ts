import { randomUUID } from "node:crypto";
import { createDefaultRedactor } from "./redaction.js";
import type { AgentEvent, AgentEventInput, RecorderSink, RedactionRule } from "./types.js";

export interface RecorderOptions {
  redactor?: RedactionRule;
  sink: RecorderSink;
}

export function createRecorder(options: RecorderOptions) {
  const redactor = options.redactor ?? createDefaultRedactor();

  async function record(input: AgentEventInput): Promise<AgentEvent> {
    const event: AgentEvent = {
      ...input,
      id: randomUUID(),
      input: redactor(input.input),
      output: redactor(input.output),
      metadata: redactor(input.metadata) as AgentEvent["metadata"],
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      schemaVersion: "2026-06-03"
    };

    await options.sink.write(event);
    return event;
  }

  return {
    record
  };
}
