import { v4 as uuidv4 } from 'uuid';
import { BadRequestError } from '../errors/app-error';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function generateId(): string {
  return uuidv4();
}

export function generateCorrelationId(): string {
  return uuidv4();
}

export function isValidUuidV4(value: string): boolean {
  return typeof value === 'string' && UUID_V4_REGEX.test(value);
}

export function assertValidUuidV4(value: string, fieldName = 'id'): string {
  if (!isValidUuidV4(value)) {
    throw new BadRequestError(`${fieldName} must be a valid UUID v4`);
  }
  return value;
}
