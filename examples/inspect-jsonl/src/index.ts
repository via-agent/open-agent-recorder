// Example: Inspect JSONL storage directly
//
// This demonstrates how to read and parse the persisted events.jsonl file
// to understand the stored trace format.

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const STORAGE_PATH = process.env.COLLECTOR_STORAGE_PATH ?? "./data/events.jsonl";

interface AgentEvent {
  id: string;
  kind: string;
  occurredAt: string;
  schemaVersion: string;
  trace: {
    traceId: string;
    [key: string]: unknown;
  };
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

interface TraceSummary {
  traceId: string;
  events: AgentEvent[];
  eventCount: number;
  kinds: Set<string>;
  startedAt: string;
  lastOccurredAt: string;
}

async function loadEvents(filePath: string): Promise<AgentEvent[]> {
  try {
    const content = await readFile(filePath, "utf8");
    const events: AgentEvent[] = [];

    for (const line of content.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      try {
        const event = JSON.parse(trimmed);
        events.push(event);
      } catch {
        console.warn(`Skipping malformed line: ${trimmed.slice(0, 50)}...`);
      }
    }

    return events;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`Storage file not found: ${filePath}`);
      console.log("Start the collector and send events first.");
      return [];
    }

    throw error;
  }
}

function groupByTrace(events: AgentEvent[]): Map<string, TraceSummary> {
  const traces = new Map<string, TraceSummary>();

  for (const event of events) {
    const traceId = event.trace.traceId;
    let summary = traces.get(traceId);

    if (!summary) {
      summary = {
        traceId,
        events: [],
        eventCount: 0,
        kinds: new Set(),
        startedAt: event.occurredAt,
        lastOccurredAt: event.occurredAt
      };
      traces.set(traceId, summary);
    }

    summary.events.push(event);
    summary.eventCount++;
    summary.kinds.add(event.kind);

    if (event.occurredAt < summary.startedAt) {
      summary.startedAt = event.occurredAt;
    }

    if (event.occurredAt > summary.lastOccurredAt) {
      summary.lastOccurredAt = event.occurredAt;
    }
  }

  return traces;
}

function inspectRedaction(event: AgentEvent): void {
  const redactedFields: string[] = [];

  function checkValue(value: unknown, path: string): void {
    if (typeof value === "string" && value === "[REDACTED]") {
      redactedFields.push(path);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, nested] of Object.entries(value)) {
        checkValue(nested, `${path}.${key}`);
      }
    }
  }

  checkValue(event.input, "input");
  checkValue(event.output, "output");
  checkValue(event.metadata, "metadata");

  if (redactedFields.length > 0) {
    console.log(`  Redacted fields: ${redactedFields.join(", ")}`);
  }
}

async function main() {
  const storagePath = resolve(STORAGE_PATH);
  console.log(`Reading persisted events from: ${storagePath}\n`);

  const events = await loadEvents(storagePath);

  if (events.length === 0) {
    return;
  }

  console.log(`Loaded ${events.length} events\n`);

  const traces = groupByTrace(events);
  console.log(`Found ${traces.size} unique traces:\n`);

  for (const summary of traces.values()) {
    console.log(`Trace: ${summary.traceId}`);
    console.log(`  Events: ${summary.eventCount}`);
    console.log(`  Kinds: ${[...summary.kinds].join(", ")}`);
    console.log(`  Started: ${summary.startedAt}`);
    console.log(`  Last activity: ${summary.lastOccurredAt}`);

    for (const event of summary.events) {
      console.log(`\n  Event: ${event.id} (${event.kind})`);
      inspectRedaction(event);
    }

    console.log();
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
