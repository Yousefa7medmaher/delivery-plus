import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SERVICE_DEFINITIONS = [
  {
    service: 'auth',
    publicPrefix: '/api/auth',
    routes: [
      { method: 'post', path: '/register', summary: 'Register a new account', auth: false },
      { method: 'post', path: '/login', summary: 'Login and receive a JWT', auth: false },
      { method: 'post', path: '/verify-email', summary: 'Verify an email address with a token', auth: false },
      { method: 'post', path: '/resend-verification', summary: 'Resend email verification', auth: false },
      { method: 'get', path: '/me', summary: 'Get the current authenticated user', auth: true },
    ],
  },
  {
    service: 'users',
    publicPrefix: '/api/users',
    routes: [
      { method: 'get', path: '/me', summary: 'Get the current authenticated user profile', auth: true },
      { method: 'patch', path: '/me', summary: 'Update the current authenticated user profile', auth: true },
      { method: 'get', path: '/me/orders', summary: 'Get the current user order history', auth: true },
      { method: 'get', path: '/:id', summary: 'Get a user profile by id', auth: true },
    ],
  },
  {
    service: 'restaurants',
    publicPrefix: '/api/restaurants',
    routes: [
      { method: 'post', path: '', summary: 'Create a restaurant', auth: true },
      { method: 'get', path: '', summary: 'List restaurants', auth: false },
      { method: 'get', path: '/:id', summary: 'Get a restaurant by id', auth: false },
      { method: 'patch', path: '/:id', summary: 'Update restaurant details', auth: true },
      { method: 'patch', path: '/:id/status', summary: 'Update restaurant status', auth: true },
      { method: 'get', path: '/:id/ownership/:userId', summary: 'Check restaurant ownership', auth: false },
    ],
  },
  {
    service: 'menus',
    publicPrefix: '/api/menus',
    routes: [
      { method: 'post', path: '/categories', summary: 'Create a menu category', auth: true },
      { method: 'get', path: '/restaurants/:restaurantId/menu', summary: 'List menu categories and items for a restaurant', auth: false },
      { method: 'get', path: '/menu-items/:id', summary: 'Get a menu item by id', auth: false },
      { method: 'post', path: '/menu-items', summary: 'Create a menu item', auth: true },
      { method: 'patch', path: '/menu-items/:id', summary: 'Update a menu item', auth: true },
      { method: 'delete', path: '/menu-items/:id', summary: 'Delete a menu item', auth: true },
      { method: 'patch', path: '/menu-items/:id/availability', summary: 'Update menu item availability', auth: true },
    ],
  },
  {
    service: 'cart',
    publicPrefix: '/api/cart',
    routes: [
      { method: 'get', path: '', summary: 'Get the current user cart', auth: true },
      { method: 'post', path: '/items', summary: 'Add an item to the cart', auth: true },
      { method: 'patch', path: '/items/:menuItemId', summary: 'Update the quantity of an item', auth: true },
      { method: 'delete', path: '/items/:menuItemId', summary: 'Remove an item from the cart', auth: true },
      { method: 'delete', path: '', summary: 'Clear the cart', auth: true },
    ],
  },
  {
    service: 'orders',
    publicPrefix: '/api/orders',
    routes: [
      { method: 'post', path: '', summary: 'Create an order from the current cart', auth: true },
      { method: 'get', path: '', summary: 'List the current customer orders', auth: true },
      { method: 'get', path: '/restaurant/:restaurantId', summary: 'List orders for a restaurant', auth: true },
      { method: 'get', path: '/:id', summary: 'Get an order by id', auth: true },
      { method: 'patch', path: '/:id/status', summary: 'Transition an order status', auth: true },
    ],
  },
  {
    service: 'payments',
    publicPrefix: '/api/payments',
    routes: [
      { method: 'post', path: '', summary: 'Create a payment for an order', auth: true },
      { method: 'post', path: '/:id/process', summary: 'Process a payment', auth: true },
      { method: 'get', path: '/:id', summary: 'Get payment status', auth: true },
      { method: 'post', path: '/:id/refund', summary: 'Refund a payment', auth: true },
    ],
  },
  {
    service: 'deliveries',
    publicPrefix: '/api/deliveries',
    routes: [
      { method: 'post', path: '', summary: 'Create a delivery', auth: true },
      { method: 'post', path: '/:id/assign', summary: 'Assign a delivery to a driver', auth: true },
      { method: 'post', path: '/:id/pickup', summary: 'Mark a delivery as picked up', auth: true },
      { method: 'post', path: '/:id/start', summary: 'Start a delivery run', auth: true },
      { method: 'post', path: '/:id/complete', summary: 'Complete a delivery', auth: true },
      { method: 'post', path: '/:id/cancel', summary: 'Cancel a delivery', auth: true },
      { method: 'get', path: '/:id', summary: 'Get a delivery by id', auth: true },
    ],
  },
  {
    service: 'drivers',
    publicPrefix: '/api/drivers',
    routes: [
      { method: 'post', path: '/register', summary: 'Register a driver profile', auth: true },
      { method: 'get', path: '/me', summary: 'Get the current driver profile', auth: true },
      { method: 'post', path: '/me/online', summary: 'Go online', auth: true },
      { method: 'post', path: '/me/offline', summary: 'Go offline', auth: true },
      { method: 'post', path: '/me/status', summary: 'Set driver status explicitly', auth: true },
      { method: 'get', path: '/available', summary: 'List available drivers', auth: false },
      { method: 'get', path: '/:id', summary: 'Get a driver by id', auth: false },
      { method: 'patch', path: '/:id/status', summary: 'Set a driver status as admin', auth: true },
    ],
  },
  {
    service: 'tracking',
    publicPrefix: '/api/tracking',
    routes: [
      { method: 'post', path: '/location', summary: 'Report the current driver location', auth: true },
      { method: 'get', path: '/driver/:userId', summary: 'Get a driver location by user id', auth: false },
      { method: 'get', path: '/delivery/:deliveryId', summary: 'Get combined delivery tracking', auth: true },
    ],
  },
  {
    service: 'notifications',
    publicPrefix: '/api/notifications',
    routes: [
      { method: 'get', path: '', summary: 'List notifications for the current user', auth: true },
      { method: 'patch', path: '/:id/read', summary: 'Mark a notification as read', auth: true },
      { method: 'patch', path: '/read-all', summary: 'Mark all notifications as read', auth: true },
    ],
  },
] as const;

const SERVICE_PREFIXES = SERVICE_DEFINITIONS.map((service) => service.publicPrefix);

function joinPublicPath(prefix: string, relativePath: string): string {
  if (!relativePath) {
    return prefix;
  }

  return `${prefix}${relativePath.startsWith('/') ? relativePath : `/${relativePath}`}`;
}

const baseSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      statusCode: { type: 'integer', example: 400 },
      message: { type: 'string', example: 'Bad Request' },
      error: { type: 'string', nullable: true },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', format: 'password' },
    },
  },
  RegisterRequest: {
    type: 'object',
    required: ['email', 'password', 'name'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', format: 'password' },
      name: { type: 'string' },
    },
  },
  AuthTokenResponse: {
    type: 'object',
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      userId: { type: 'string' },
    },
  },
  UserProfile: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      role: { type: 'string', enum: ['CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER', 'ADMIN'] },
    },
  },
};

const publicSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Delivery Plus Public API',
    version: '1.0.0',
    description:
      'Public Gateway contract for the Delivery Plus food delivery platform. This specification exposes the canonical public paths behind the API Gateway and intentionally excludes internal-only service routes.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: SERVICE_DEFINITIONS.map(({ service }) => ({ name: service, description: `${service} service endpoints` })),
  paths: {} as Record<string, Record<string, any>>,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: baseSchemas,
  },
};

for (const service of SERVICE_DEFINITIONS) {
  for (const route of service.routes) {
    const pathKey = joinPublicPath(service.publicPrefix, route.path);
    const operationId = `${service.service}_${route.method}_${pathKey.replace(/[\/:{}-]+/g, '_').replace(/^_+|_+$/g, '')}`;

    const operation: Record<string, any> = {
      summary: route.summary,
      tags: [service.service],
      operationId,
      responses: {
        '200': { description: 'Successful response' },
        '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
      },
    };

    if (route.auth) {
      operation.security = [{ bearerAuth: [] }];
      operation.responses['401'] = { description: 'Missing or invalid JWT' };
    } else {
      operation.security = [];
    }

    if (route.method === 'post' && service.service === 'auth' && route.path === '/register') {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
        },
      };
    }

    if (route.method === 'post' && service.service === 'auth' && route.path === '/login') {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
        },
      };
      operation.responses['200'] = {
        description: 'Authenticated response',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/AuthTokenResponse' } },
        },
      };
    }

    if (!publicSpec.paths[pathKey]) {
      publicSpec.paths[pathKey] = {};
    }

    publicSpec.paths[pathKey][route.method] = operation;
  }
}

const outputPath = join(process.cwd(), 'docs', 'openapi', 'delivery-plus-public.json');
mkdirSync(join(process.cwd(), 'docs', 'openapi'), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(publicSpec, null, 2)}\n`, 'utf8');

console.log(`Generated public OpenAPI contract at ${outputPath}`);
console.log(`Service prefixes covered: ${SERVICE_PREFIXES.join(', ')}`);
