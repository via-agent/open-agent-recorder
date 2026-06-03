import { describe, expect, it } from "vitest";
import { redactValue } from "./redaction.js";

describe("redactValue", () => {
  it("redacts common sensitive fields and strings", () => {
    const redacted = redactValue({
      email: "person@example.com",
      headers: {
        authorization: "Bearer abcdefghijklmnopqrstuvwxyz123456"
      },
      prompt: "contact person@example.com with sk-abcdefghijklmnopqrstuvwxyz123456"
    });

    expect(redacted).toEqual({
      email: "[REDACTED]",
      headers: {
        authorization: "[REDACTED]"
      },
      prompt: "contact [REDACTED] with [REDACTED]"
    });
  });
});
