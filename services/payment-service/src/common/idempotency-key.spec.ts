import { BadRequestError } from '@food-delivery/shared';
import { IDEMPOTENCY_KEY_MAX_LENGTH, parseIdempotencyKey } from './idempotency-key';

describe('parseIdempotencyKey', () => {
  it('returns undefined when the header is absent', () => {
    expect(parseIdempotencyKey(undefined)).toBeUndefined();
  });

  it('accepts and trims a UUID', () => {
    expect(parseIdempotencyKey('  6f1c2b9e-6a4d-4f3e-9d7a-2f0b8c1e5a47 ')).toBe(
      '6f1c2b9e-6a4d-4f3e-9d7a-2f0b8c1e5a47',
    );
  });

  it.each([
    ['empty', ''],
    ['whitespace only', '   '],
    ['inner space', 'a b'],
    ['non-ASCII', 'clave-ñ'],
    ['too long', 'a'.repeat(IDEMPOTENCY_KEY_MAX_LENGTH + 1)],
  ])('rejects %s', (_label, value) => {
    expect(() => parseIdempotencyKey(value)).toThrow(BadRequestError);
  });

  it('rejects a repeated header', () => {
    expect(() => parseIdempotencyKey(['a', 'b'])).toThrow(BadRequestError);
  });
});
