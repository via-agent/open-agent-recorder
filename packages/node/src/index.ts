import type { AgentEvent, RecorderSink } from "@open-agent-recorder/core";

export interface CollectorSinkOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

export function createCollectorSink(options: CollectorSinkOptions = {}): RecorderSink {
  const endpoint = options.endpoint ?? "http://localhost:4319/v1/events";
  const fetcher = options.fetchImpl ?? fetch;

  return {
    async write(event: AgentEvent) {
      const response = await fetcher(endpoint, {
        body: JSON.stringify(event),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      if (!response.ok) {
        throw new Error(`Collector rejected event with HTTP ${response.status}`);
      }
    }
  };
}
