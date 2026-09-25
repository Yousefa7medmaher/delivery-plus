import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SERVICE_PREFIXES = [
  '/api/auth',
  '/api/users',
  '/api/restaurants',
  '/api/menus',
  '/api/cart',
  '/api/orders',
  '/api/payments',
  '/api/deliveries',
  '/api/drivers',
  '/api/tracking',
  '/api/notifications',
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const filePath = join(process.cwd(), 'docs', 'openapi', 'delivery-plus-public.json');
const raw = readFileSync(filePath, 'utf8');
const doc = JSON.parse(raw) as Record<string, any>;

assert(doc.openapi === '3.0.3', 'OpenAPI version must be 3.0.3');
assert(doc.servers?.[0]?.url === 'http://localhost:3000', 'Gateway server URL must point to localhost:3000');
assert(doc.paths && typeof doc.paths === 'object', 'paths must exist');

const pathNames = Object.keys(doc.paths);
const seenMethods = new Set<string>();
const seenOperationIds = new Set<string>();
const refs = new Set<string>();

for (const path of pathNames) {
  assert(path.startsWith('/api/'), `Public path must start with /api/: ${path}`);
  assert(!path.includes('/internal'), `Internal-only route leaked into public OpenAPI: ${path}`);
  assert(!path.toLowerCase().includes('docs-json'), `Docs JSON route leaked into business contract: ${path}`);

  const methods = Object.keys(doc.paths[path] ?? {});
  for (const method of methods) {
    const key = `${path}::${method}`;
    assert(!seenMethods.has(key), `Duplicate path/method combination found: ${key}`);
    seenMethods.add(key);

    const operation = doc.paths[path][method];
    assert(operation.operationId, `OperationId missing for ${method.toUpperCase()} ${path}`);
    assert(!seenOperationIds.has(operation.operationId), `Duplicate operationId: ${operation.operationId}`);
    seenOperationIds.add(operation.operationId);
  }
}

for (const prefix of SERVICE_PREFIXES) {
  assert(pathNames.some((path) => path.startsWith(prefix)), `Missing public routes for service prefix: ${prefix}`);
}

const visit = (node: unknown) => {
  if (Array.isArray(node)) {
    for (const value of node) visit(value);
    return;
  }

  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === '$ref' && typeof value === 'string') {
        refs.add(value);
      }
      visit(value);
    }
  }
};

visit(doc);

for (const ref of refs) {
  if (!ref.startsWith('#/components/')) {
    throw new Error(`Unsupported $ref found in public OpenAPI: ${ref}`);
  }
  const segments = ref.replace('#/', '').split('/');
  let current: any = doc;
  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      throw new Error(`Broken $ref in public OpenAPI: ${ref}`);
    }
  }
}

assert(Array.isArray(doc.tags) && doc.tags.length >= SERVICE_PREFIXES.length, 'Public OpenAPI must include service tags');

console.log(`Validated public OpenAPI contract at ${filePath}`);
console.log(`Paths checked: ${pathNames.length}`);
console.log(`Service prefixes covered: ${SERVICE_PREFIXES.join(', ')}`);
