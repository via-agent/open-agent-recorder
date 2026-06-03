// Example: Query traces from the collector API
//
// This demonstrates how to interact with the trace API programmatically.
// Start the collector first: pnpm dev:collector

const COLLECTOR_URL = process.env.COLLECTOR_URL ?? "http://localhost:4319";

interface TraceSummary {
  traceId: string;
  eventCount: number;
  startedAt: string;
  lastOccurredAt: string;
  kinds: string[];
}

interface TraceDetail {
  trace: TraceSummary;
  events: unknown[];
}

async function listTraces(): Promise<TraceSummary[]> {
  const response = await fetch(`${COLLECTOR_URL}/v1/traces`);

  if (!response.ok) {
    throw new Error(`Failed to list traces: HTTP ${response.status}`);
  }

  const body = await response.json();
  return body.traces;
}

async function getTrace(traceId: string): Promise<TraceDetail> {
  const response = await fetch(`${COLLECTOR_URL}/v1/traces/${encodeURIComponent(traceId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch trace ${traceId}: HTTP ${response.status}`);
  }

  return response.json();
}

async function listEventsByTraceId(traceId: string): Promise<unknown[]> {
  const response = await fetch(`${COLLECTOR_URL}/v1/events?traceId=${encodeURIComponent(traceId)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch events for trace ${traceId}: HTTP ${response.status}`);
  }

  const body = await response.json();
  return body.events;
}

async function main() {
  console.log("Querying traces from collector...\n");

  const traces = await listTraces();
  console.log(`Found ${traces.length} traces:\n`);

  for (const trace of traces) {
    console.log(`Trace: ${trace.traceId}`);
    console.log(`  Events: ${trace.eventCount}`);
    console.log(`  Kinds: ${trace.kinds.join(", ")}`);
    console.log(`  Started: ${trace.startedAt}`);
    console.log(`  Last activity: ${trace.lastOccurredAt}`);
    console.log();
  }

  if (traces.length > 0) {
    const firstTraceId = traces[0].traceId;
    console.log(`Fetching detailed events for trace: ${firstTraceId}\n`);

    const detail = await getTrace(firstTraceId);
    console.log(`Trace has ${detail.events.length} events:`);

    for (const event of detail.events) {
      console.log(JSON.stringify(event, null, 2));
    }
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
