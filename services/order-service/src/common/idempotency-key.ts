import { BadRequestError } from '@food-delivery/shared';

export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
export const IDEMPOTENCY_KEY_MAX_LENGTH = 255;

const IDEMPOTENCY_KEY_PATTERN = /^[\x21-\x7E]+$/;

export function parseIdempotencyKey(raw: string | string[] | undefined): string | undefined {
  if (raw === undefined) return undefined;
  if (Array.isArray(raw)) {
    throw new BadRequestError('Idempotency-Key header must be sent once');
  }
  const key = raw.trim();
  if (key.length === 0 || key.length > IDEMPOTENCY_KEY_MAX_LENGTH || !IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw new BadRequestError(
      `Idempotency-Key must be 1-${IDEMPOTENCY_KEY_MAX_LENGTH} visible ASCII characters (a UUID is recommended)`,
    );
  }
  return key;
}
