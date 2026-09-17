export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  serviceName: string;
  port: number;
  nodeEnv: string;
  redisUrl: string;
  cartTtlSeconds: number;
  jwtSecret: string;
  menuServiceUrl: string;
}

export function loadConfig(): AppConfig {
  const required = ['REDIS_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    serviceName: process.env.SERVICE_NAME || 'cart-service',
    port: parseInt(process.env.PORT || '3005', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    redisUrl: process.env.REDIS_URL as string,
    cartTtlSeconds: parseInt(process.env.CART_TTL_SECONDS || '86400', 10),
    jwtSecret: process.env.JWT_SECRET as string,
    menuServiceUrl: process.env.MENU_SERVICE_URL || 'http://localhost:3004',
  };
}
