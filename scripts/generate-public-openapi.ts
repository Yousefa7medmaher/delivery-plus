import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  SERVICE_PREFIXES,
  generatePublicOpenApiDocument,
} from '../services/api-gateway/src/public-openapi';

export * from '../services/api-gateway/src/public-openapi';

if (require.main === module) {
  const outputPath = join(process.cwd(), 'docs', 'openapi', 'delivery-plus-public.json');
  const doc = generatePublicOpenApiDocument();
  mkdirSync(join(process.cwd(), 'docs', 'openapi'), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');

  console.log(`Generated public OpenAPI contract at ${outputPath}`);
  console.log(`Service prefixes covered: ${SERVICE_PREFIXES.join(', ')}`);
}
