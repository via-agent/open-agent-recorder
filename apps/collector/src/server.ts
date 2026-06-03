import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AgentEvent } from "@open-agent-recorder/core";

const port = Number.parseInt(process.env.PORT ?? "4319", 10);
const events: AgentEvent[] = [];

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

function isAgentEvent(value: unknown): value is AgentEvent {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "kind" in value &&
      "trace" in value &&
      "occurredAt" in value
  );
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "GET" && request.url === "/v1/events") {
      sendJson(response, 200, { events });
      return;
    }

    if (request.method === "POST" && request.url === "/v1/events") {
      const body = await readJson(request);

      if (!isAgentEvent(body)) {
        sendJson(response, 400, { error: "Invalid agent event payload" });
        return;
      }

      events.push(body);
      sendJson(response, 202, { accepted: true, id: body.id });
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, () => {
  console.log(`Open Agent Recorder collector listening on http://localhost:${port}`);
});
