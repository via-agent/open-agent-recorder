export type AgentEventKind =
  | "trace.started"
  | "model.call"
  | "tool.call"
  | "retrieval.result"
  | "annotation"
  | "error"
  | "trace.completed";

export interface TraceContext {
  traceId: string;
  sessionId?: string;
  userId?: string;
  release?: string;
  environment?: string;
}

export interface AgentEventMetadata {
  costUsd?: number;
  durationMs?: number;
  model?: string;
  provider?: string;
  tokenInput?: number;
  tokenOutput?: number;
  toolName?: string;
  [key: string]: unknown;
}

export interface AgentEventInput {
  kind: AgentEventKind;
  trace: TraceContext;
  name?: string;
  input?: unknown;
  output?: unknown;
  metadata?: AgentEventMetadata;
  occurredAt?: string;
}

export interface AgentEvent extends AgentEventInput {
  id: string;
  occurredAt: string;
  schemaVersion: "2026-06-03";
}

export type RedactionRule = (value: unknown) => unknown;

export interface RecorderSink {
  write(event: AgentEvent): Promise<void> | void;
}
