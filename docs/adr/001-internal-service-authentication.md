# ADR 001: Internal Service Authentication

- Status: accepted
- Date: 2026-09-20

## Context

The platform uses JWTs for end-user authentication, but service-to-service HTTP calls currently rely on Docker network reachability and route conventions. The clearest example is `auth-service` calling `POST /internal/users` on `user-service` without a verifiable service identity.

The repository runs services in Docker Compose and does not currently depend on a service mesh, cloud IAM, or certificate-management platform. The internal trust model therefore needs to be explicit, implementable with environment configuration, and separate from end-user JWT claims.

## Decision

Internal HTTP requests that cross a service ownership boundary will use a dedicated HMAC request-signing contract. This is separate from user JWT authentication.

The implementation contract is:

- Each calling service has a stable service identifier, such as `auth-service`.
- Each caller and receiver share a dedicated secret configured through environment variables. Secrets are never accepted from user input or stored in request bodies.
- The caller sends:
  - `X-Internal-Service`: caller service identifier
  - `X-Internal-Timestamp`: Unix timestamp in seconds
  - `X-Internal-Nonce`: unique request nonce
  - `X-Internal-Signature`: HMAC-SHA256 signature
- The signed canonical input includes the HTTP method, normalized request path, timestamp, nonce, and a SHA-256 hash of the request body.
- The receiver validates the caller identity, timestamp skew, signature, and nonce replay status before executing the internal operation.
- Internal routes are not exposed through the public API Gateway. Gateway routing must not be treated as the authentication mechanism.
- Invalid, missing, expired, or replayed internal credentials return `401` or `403` without executing the operation.
- User JWTs remain required for user-facing routes. A valid user JWT does not authorize an internal service route by itself.
- Correlation IDs remain observability metadata and are not authentication credentials.

The first application target is `auth-service` -> `user-service` for `POST /internal/users`. DP-010 applies this contract to that endpoint. DP-057 applies the related user ownership and access rules to profile reads.

## Consequences

- Internal callers have an explicit, verifiable identity.
- Request tampering, stale signatures, and basic replay attempts can be rejected.
- The design works with the current Docker Compose environment and does not require a mesh or cloud provider.
- Secrets must be provisioned and rotated per service relationship.
- A replay store is required for nonce enforcement; Redis is the current repository-compatible candidate, but the implementation must define TTL and failure behavior before rollout.
- Signing and verification must be shared carefully to avoid differences in path normalization, body serialization, or clock handling.
- The first implementation protects `POST /internal/users`; broader endpoint classification and additional callers are follow-up work.

## Alternatives considered

### Shared static bearer token

Rejected as the canonical design because a bearer token can be replayed if captured and does not bind credentials to the request contents.

### End-user JWT for internal calls

Rejected because user identity and service identity are different trust domains. It would also make internal authorization depend on a user being present.

### mTLS or service mesh

Deferred because the current repository has no certificate lifecycle, mesh, or deployment platform to operate it. It may be considered for a future deployment environment without changing the trust-boundary principle.
