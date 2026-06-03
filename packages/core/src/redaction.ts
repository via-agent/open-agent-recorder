import type { RedactionRule } from "./types.js";

const SECRET_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:sk|pk|rk|org|proj)-[A-Za-z0-9_-]{16,}\b/g,
  /\b[A-Za-z0-9_-]{32,}\b/g
];

const SENSITIVE_KEYS = new Set([
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "email",
  "password",
  "secret",
  "token"
]);

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return SECRET_PATTERNS.reduce(
      (current, pattern) => current.replace(pattern, "[REDACTED]"),
      value
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        SENSITIVE_KEYS.has(key) ? "[REDACTED]" : redactValue(nestedValue)
      ])
    );
  }

  return value;
}

export function createDefaultRedactor(extraRules: RedactionRule[] = []): RedactionRule {
  return (value: unknown) => {
    return extraRules.reduce((current, rule) => rule(current), redactValue(value));
  };
}
