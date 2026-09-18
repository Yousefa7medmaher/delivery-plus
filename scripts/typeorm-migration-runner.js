/* eslint-disable no-console */
const path = require('node:path');
require('ts-node/register/transpile-only');

const [, , serviceName, command = 'run'] = process.argv;

if (!serviceName) {
  console.error('Usage: node scripts/typeorm-migration-runner.js <service-name> [run|revert|show]');
  process.exit(1);
}

const serviceRoot = path.resolve(__dirname, '..', 'services', serviceName);
const dataSourcePath = path.join(serviceRoot, 'src', 'database', 'data-source.ts');

async function main() {
  const { default: dataSource } = require(dataSourcePath);

  await dataSource.initialize();

  switch (command) {
    case 'run':
      await dataSource.runMigrations();
      console.log(`Completed migrations for ${serviceName}.`);
      break;
    case 'revert':
      await dataSource.undoLastMigration();
      console.log(`Reverted last migration for ${serviceName}.`);
      break;
    case 'show':
      console.log(await dataSource.showMigrations());
      break;
    default:
      console.error(`Unsupported command: ${command}. Use run, revert, or show.`);
      process.exit(1);
  }

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
