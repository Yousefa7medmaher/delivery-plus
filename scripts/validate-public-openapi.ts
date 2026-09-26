import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SERVICE_PREFIXES, validatePublicOpenApiDocument } from '../services/api-gateway/src/public-openapi';

export { SERVICE_PREFIXES, validatePublicOpenApiDocument } from '../services/api-gateway/src/public-openapi';

if (require.main === module) {
  const filePath = join(process.cwd(), 'docs', 'openapi', 'delivery-plus-public.json');
  const raw = readFileSync(filePath, 'utf8');
  const doc = JSON.parse(raw) as Record<string, any>;
  validatePublicOpenApiDocument(doc);

  console.log(`Validated public OpenAPI contract at ${filePath}`);
  console.log(`Paths checked: ${Object.keys(doc.paths).length}`);
  console.log(`Service prefixes covered: ${SERVICE_PREFIXES.join(', ')}`);
}
