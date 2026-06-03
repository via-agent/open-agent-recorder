import { mkdir, readFile, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createDefaultRedactor, type AgentEvent } from "@open-agent-recorder/core";

const DEFAULT_STORAGE_PATH = "./data/events.jsonl";
const VALID_EVENT_KINDS = new Set<AgentEvent["kind"]>([
  "trace.started",
  "model.call",
  "tool.call",
  "retrieval.result",
  "annotation",
  "error",
  "trace.completed"
]);

const redact = createDefaultRedactor();

export interface TraceSummary {
  traceId: string;
  eventCount: number;
  startedAt: string;
  lastOccurredAt: string;
  kinds: AgentEvent["kind"][];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function isAgentEvent(value: unknown): value is AgentEvent {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.kind !== "string" ||
    typeof value.occurredAt !== "string" ||
    typeof value.schemaVersion !== "string" ||
    !VALID_EVENT_KINDS.has(value.kind as AgentEvent["kind"])
  ) {
    return false;
  }

  if (!isRecord(value.trace) || typeof value.trace.traceId !== "string") {
    return false;
  }

  return true;
}

export function normalizeEvent(value: unknown): AgentEvent | null {
  if (!isAgentEvent(value)) {
    return null;
  }

  const event: AgentEvent = {
    ...value,
    trace: {
      ...value.trace
    }
  };

  if (value.input !== undefined) {
    event.input = redact(value.input);
  }

  if (value.metadata !== undefined) {
    event.metadata = redact(value.metadata) as AgentEvent["metadata"];
  }

  if (value.output !== undefined) {
    event.output = redact(value.output);
  }

  return event;
}

export function summarizeTrace(events: AgentEvent[]): TraceSummary {
  const sortedEvents = [...events].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  const firstEvent = sortedEvents[0];
  const lastEvent = sortedEvents[sortedEvents.length - 1];

  return {
    eventCount: sortedEvents.length,
    kinds: [...new Set(sortedEvents.map((event) => event.kind))],
    lastOccurredAt: lastEvent.occurredAt,
    startedAt: firstEvent.occurredAt,
    traceId: firstEvent.trace.traceId
  };
}

export function resolveStoragePath(storagePath = process.env.COLLECTOR_STORAGE_PATH): string {
  return resolve(storagePath ?? DEFAULT_STORAGE_PATH);
}

export async function loadEvents(storagePath: string): Promise<AgentEvent[]> {
  try {
    const content = await readFile(storagePath, "utf8");
    const events: AgentEvent[] = [];

    for (const [index, line] of content.split("\n").entries()) {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        continue;
      }

      try {
        const parsed = JSON.parse(trimmedLine) as unknown;
        const event = normalizeEvent(parsed);

        if (event) {
          events.push(event);
          continue;
        }

        console.warn(`Skipping invalid event at line ${index + 1} in ${storagePath}`);
      } catch {
        console.warn(`Skipping malformed JSONL line ${index + 1} in ${storagePath}`);
      }
    }

    return events;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export class JsonlEventStore {
  #events: AgentEvent[];
  #storagePath: string;
  #writeChain: Promise<void>;

  constructor(storagePath: string, events: AgentEvent[] = []) {
    this.#storagePath = storagePath;
    this.#events = events;
    this.#writeChain = Promise.resolve();
  }

  static async create(storagePath = resolveStoragePath()) {
    const events = await loadEvents(storagePath);
    return new JsonlEventStore(storagePath, events);
  }

  getAll(): AgentEvent[] {
    return [...this.#events];
  }

  getTrace(traceId: string): AgentEvent[] {
    return this.#events.filter((event) => event.trace.traceId === traceId);
  }

  getTraceSummaries(): TraceSummary[] {
    const traces = new Map<string, AgentEvent[]>();

    for (const event of this.#events) {
      const traceEvents = traces.get(event.trace.traceId) ?? [];
      traceEvents.push(event);
      traces.set(event.trace.traceId, traceEvents);
    }

    return [...traces.values()]
      .map((events) => summarizeTrace(events))
      .sort((left, right) => right.lastOccurredAt.localeCompare(left.lastOccurredAt));
  }

  async append(event: AgentEvent): Promise<void> {
    const line = `${JSON.stringify(event)}\n`;

    this.#writeChain = this.#writeChain.then(async () => {
      await mkdir(dirname(this.#storagePath), { recursive: true });
      await appendFile(this.#storagePath, line, "utf8");
      this.#events.push(event);
    });

    return this.#writeChain;
  }
}
