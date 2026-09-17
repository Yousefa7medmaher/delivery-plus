# Security Policy

## Reporting a Vulnerability

Please do not open a public GitHub issue for a suspected vulnerability. Contact the repository maintainers through the private security contact configured for the project, or use GitHub's private vulnerability reporting feature when enabled.

Include the affected component, a concise description, reproduction steps, impact, and a suggested fix when available. Do not include passwords, tokens, customer data, or other secrets in the report.

## Scope

This is a local-development-oriented microservices demo (see
[.project-context/13-known-issues-and-gotchas.md](.project-context/13-known-issues-and-gotchas.md)
for documented design tradeoffs). The following are intentional for local development
and are not considered vulnerabilities:

- default JWT secrets and Postgres credentials in `docker-compose.yml` and `.env.example`
- internal service-to-service HTTP calls that are not independently rate-limited
  (they are reachable only on the internal Docker network, not from outside the gateway)

Please do report:

- authentication or authorization bypass (JWT validation, role guard bypass)
- injection vulnerabilities (SQL, NoSQL, command injection)
- any internal service endpoint reachable from outside the API gateway
- secrets or credentials committed to the repository history
- any deviation from the auth/role model described in
  [.project-context/07-auth-and-security.md](.project-context/07-auth-and-security.md)

## Responsible Disclosure

Give maintainers reasonable time to investigate and release a fix before public disclosure. We will acknowledge valid reports, coordinate a fix where possible, and document security advisories when appropriate.
