export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  serviceName: string;
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  orderServiceUrl: string;
  paymentSuccessRate: number;
}

export function loadConfig(): AppConfig {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    serviceName: process.env.SERVICE_NAME || 'payment-service',
    port: parseInt(process.env.PORT || '3007', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL as string,
    jwtSecret: process.env.JWT_SECRET as string,
    orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://localhost:3006',
    paymentSuccessRate: parseFloat(process.env.PAYMENT_SUCCESS_RATE || '0.9'),
  };
}
