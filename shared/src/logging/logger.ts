import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
  event?: string;
  [key: string]: unknown;
}

/**
 * Creates a structured JSON logger for a given service.
 * Output fields: timestamp, level, service, environment, message, ...context
 */
export function createServiceLogger(serviceName: string): WinstonLogger {
  return createLogger({
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: {
      service: serviceName,
      environment: process.env.NODE_ENV || 'development',
    },
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    ),
    transports: [new transports.Console()],
  });
}

export type { WinstonLogger };
