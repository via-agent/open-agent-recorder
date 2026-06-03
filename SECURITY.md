# Security Policy

Open Agent Recorder is designed for privacy-aware observability of AI agents and LLM applications. Security and data handling are core project concerns.

## Supported versions

This project is currently pre-1.0. Security fixes will target the latest version on the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for security vulnerabilities.

Instead, report the issue privately to the project maintainer with:

- a description of the vulnerability
- steps to reproduce
- affected package or component
- potential impact
- suggested fix, if known

If no private security contact is listed yet, open a minimal public issue asking for a private disclosure channel without including exploit details.

## Sensitive data handling

Open Agent Recorder should never persist raw secrets by default.

The default recorder redacts common sensitive values before persistence, including:

- API keys
- bearer tokens
- cookies
- passwords
- emails
- long credential-like strings

The collector also applies defensive redaction to inbound events before storing them locally.

## Security expectations for contributors

Contributors must not commit:

- real API keys
- bearer tokens
- cookies
- passwords
- private user data
- production traces containing sensitive information

Use fake fixtures only. Tests should verify redaction behavior without using real secrets.

## Local-first default

The collector persists events locally by default. Any feature that sends traces to an external service must be explicit, opt-in, documented, and reviewed carefully.
