#!/usr/bin/env node

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AgentEvent } from "@open-agent-recorder/core";
import {
  JsonlEventStore,
  normalizeEvent,
  resolveStoragePath,
  type TraceSummary
} from "./storage.js";

const port = Number.parseInt(process.env.PORT ?? "4319", 10);

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(body, null, 2));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export interface EventStore {
  append(event: AgentEvent): Promise<void>;
  getAll(): AgentEvent[];
  getTrace(traceId: string): AgentEvent[];
  getTraceSummaries(): TraceSummary[];
}

export function createCollectorServer(store: EventStore): Server {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/events") {
        const traceId = url.searchParams.get("traceId");
        const events = traceId ? store.getTrace(traceId) : store.getAll();
        sendJson(response, 200, { events });
        return;
      }

      if (request.method === "GET" && url.pathname === "/v1/traces") {
        sendJson(response, 200, { traces: store.getTraceSummaries() });
        return;
      }

      if (request.method === "GET" && url.pathname.startsWith("/v1/traces/")) {
        const traceId = decodeURIComponent(url.pathname.replace("/v1/traces/", ""));
        const events = store.getTrace(traceId);

        if (events.length === 0) {
          sendJson(response, 404, { error: "Trace not found" });
          return;
        }

        sendJson(response, 200, {
          events,
          trace: store.getTraceSummaries().find((trace) => trace.traceId === traceId)
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/v1/events") {
        const body = await readJson(request);
        const event = normalizeEvent(body);

        if (!event) {
          sendJson(response, 400, { error: "Invalid agent event payload" });
          return;
        }

        await store.append(event);
        sendJson(response, 202, { accepted: true, id: event.id, traceId: event.trace.traceId });
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}

export async function startCollector() {
  const storagePath = resolveStoragePath();
  const store = await JsonlEventStore.create(storagePath);
  const server = createCollectorServer(store);

  server.listen(port, () => {
    console.log(`Open Agent Recorder collector listening on http://localhost:${port}`);
    console.log(`Persisting events to ${storagePath}`);
  });

  return server;
}

const entrypoint = process.argv[1];

if (entrypoint && import.meta.url === new URL(entrypoint, "file:").href) {
  void startCollector();
}
