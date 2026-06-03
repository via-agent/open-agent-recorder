import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { AgentEvent } from "@open-agent-recorder/core";
import { createCollectorServer } from "./server.js";
import { JsonlEventStore, loadEvents, normalizeEvent } from "./storage.js";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0).map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

function createEvent(overrides: Partial<AgentEvent> = {}): AgentEvent {
  return {
    id: "event_1",
    kind: "model.call",
    occurredAt: "2026-06-03T00:00:00.000Z",
    schemaVersion: "2026-06-03",
    trace: {
      traceId: "trace_1"
    },
    ...overrides
  };
}

async function createTempPath(filename = "events.jsonl") {
  const directory = await mkdtemp(join(tmpdir(), "open-agent-recorder-collector-"));
  createdDirs.push(directory);
  return join(directory, filename);
}

describe("normalizeEvent", () => {
  it("redacts sensitive fields in input, output, and metadata", () => {
    const event = createEvent({
      input: {
        apiKey: "sk-secret-12345",
        prompt: "test"
      },
      metadata: {
        token: "bearer-xyz"
      },
      output: {
        email: "user@example.com"
      }
    });

    const normalized = normalizeEvent(event);

    expect(normalized?.input).toEqual({
      apiKey: "[REDACTED]",
      prompt: "test"
    });
    expect(normalized?.metadata).toEqual({
      token: "[REDACTED]"
    });
    expect(normalized?.output).toEqual({
      email: "[REDACTED]"
    });
  });

  it("returns null for invalid event shapes", () => {
    expect(normalizeEvent({ invalid: true })).toBeNull();
    expect(normalizeEvent(null)).toBeNull();
    expect(normalizeEvent("string")).toBeNull();
  });
});

describe("JsonlEventStore", () => {
  it("hydrates events from an existing JSONL file", async () => {
    const storagePath = await createTempPath();
    const first = createEvent();
    const second = createEvent({ id: "event_2", trace: { traceId: "trace_2" } });

    await writeFile(storagePath, `${JSON.stringify(first)}\n${JSON.stringify(second)}\n`, "utf8");

    const store = await JsonlEventStore.create(storagePath);

    expect(store.getAll()).toEqual([first, second]);
  });

  it("skips malformed JSONL lines during hydration", async () => {
    const storagePath = await createTempPath();
    const event = createEvent();

    await writeFile(storagePath, `${JSON.stringify(event)}\n{not-json}\n`, "utf8");

    await expect(loadEvents(storagePath)).resolves.toEqual([event]);
  });

  it("appends events to storage and memory", async () => {
    const storagePath = await createTempPath();
    const store = await JsonlEventStore.create(storagePath);
    const event = createEvent();

    await store.append(event);

    expect(store.getAll()).toEqual([event]);
    await expect(readFile(storagePath, "utf8")).resolves.toBe(`${JSON.stringify(event)}\n`);
  });

  it("serializes concurrent appends into valid JSONL", async () => {
    const storagePath = await createTempPath();
    const store = await JsonlEventStore.create(storagePath);
    const events = [
      createEvent({ id: "event_1" }),
      createEvent({ id: "event_2" }),
      createEvent({ id: "event_3" })
    ];

    await Promise.all(events.map((event) => store.append(event)));

    expect(store.getAll()).toEqual(events);
    await expect(loadEvents(storagePath)).resolves.toEqual(events);
  });
});

describe("createCollectorServer", () => {
  it("returns 400 for an invalid payload", async () => {
    const store = await JsonlEventStore.create(await createTempPath());
    const server = createCollectorServer(store);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on an ephemeral port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/events`, {
      body: JSON.stringify({ invalid: true }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: "Invalid agent event payload" });
    expect(store.getAll()).toEqual([]);

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  it("returns 500 and keeps memory unchanged when append fails", async () => {
    const event = createEvent();
    const failingStore = {
      append: async () => {
        throw new Error("Disk unavailable");
      },
      getAll: () => [],
      getTrace: () => [],
      getTraceSummaries: () => []
    };

    const server = createCollectorServer(failingStore);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on an ephemeral port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/events`, {
      body: JSON.stringify(event),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload).toEqual({ error: "Disk unavailable" });

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  it("returns trace summaries via GET /v1/traces", async () => {
    const storagePath = await createTempPath();
    const store = await JsonlEventStore.create(storagePath);

    await store.append(createEvent({ trace: { traceId: "trace_a" }, occurredAt: "2026-06-03T10:00:00.000Z" }));
    await store.append(createEvent({ trace: { traceId: "trace_b" }, occurredAt: "2026-06-03T11:00:00.000Z" }));

    const server = createCollectorServer(store);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on an ephemeral port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/traces`);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.traces).toHaveLength(2);
    expect(payload.traces[0].traceId).toBe("trace_b");
    expect(payload.traces[1].traceId).toBe("trace_a");

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("returns single trace via GET /v1/traces/:traceId", async () => {
    const storagePath = await createTempPath();
    const store = await JsonlEventStore.create(storagePath);
    const event = createEvent({ trace: { traceId: "trace_xyz" } });

    await store.append(event);

    const server = createCollectorServer(store);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on an ephemeral port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/traces/trace_xyz`);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.events).toEqual([event]);
    expect(payload.trace.traceId).toBe("trace_xyz");

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("returns 404 for nonexistent trace", async () => {
    const storagePath = await createTempPath();
    const store = await JsonlEventStore.create(storagePath);
    const server = createCollectorServer(store);

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();

    if (!address || typeof address === "string") {
      throw new Error("Expected server to listen on an ephemeral port");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/traces/missing`);
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Trace not found" });

    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });
});
