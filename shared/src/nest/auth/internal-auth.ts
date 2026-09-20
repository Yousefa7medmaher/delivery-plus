import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const INTERNAL_AUTH_HEADERS = {
  service: 'x-internal-service',
  timestamp: 'x-internal-timestamp',
  nonce: 'x-internal-nonce',
  signature: 'x-internal-signature',
} as const;

export interface InternalAuthInput {
  method: string;
  path: string;
  timestamp: string;
  nonce: string;
  body: unknown;
  secret: string;
  service: string;
}

function bodyHash(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(body ?? {})).digest('hex');
}

export function canonicalInternalAuthPayload(input: Omit<InternalAuthInput, 'service'>): string {
  return [
    input.method.toUpperCase(),
    input.path,
    input.timestamp,
    input.nonce,
    bodyHash(input.body),
  ].join('\n');
}

export function signInternalRequest(input: InternalAuthInput): string {
  const payload = canonicalInternalAuthPayload(input);
  return createHmac('sha256', input.secret).update(`${input.service}\n${payload}`).digest('hex');
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}