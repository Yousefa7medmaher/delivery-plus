export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  serviceName: string;
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  userServiceUrl: string;
  internalAuthService: string;
  internalAuthSecret: string;
  emailVerificationRequired: boolean;
  maxFailedLoginAttempts: number;
  lockoutMinutes: number;
  verificationTokenTtlMinutes: number;
}

export function loadConfig(): AppConfig {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    serviceName: process.env.SERVICE_NAME || 'auth-service',
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3002',
    internalAuthService: process.env.INTERNAL_AUTH_SERVICE || 'auth-service',
    internalAuthSecret: requireInternalAuthSecret(),
    emailVerificationRequired: parseBoolean(process.env.EMAIL_VERIFICATION_REQUIRED, false),
    maxFailedLoginAttempts: parsePositiveInt('MAX_FAILED_LOGIN_ATTEMPTS', 5),
    lockoutMinutes: parsePositiveInt('LOCKOUT_MINUTES', 15),
    verificationTokenTtlMinutes: parseInt(process.env.VERIFICATION_TOKEN_TTL_MINUTES || '60', 10),
  };
}

function parsePositiveInt(key: string, defaultValue: number): number {
  const raw = process.env[key];

  if (raw === undefined || raw === '') {
    return defaultValue;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key}: ${raw}`);
  }

  return value;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

function requireInternalAuthSecret(): string {
  const secret = process.env.INTERNAL_AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variables: INTERNAL_AUTH_SECRET');
  }
  return secret || 'local-internal-auth-development-only';
}
