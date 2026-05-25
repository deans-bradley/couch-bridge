import chalk from 'chalk';
import { COMMAND, OPTION } from '../constants/description.js';
import config, { getActiveInstanceName, getInstances, saveConfig } from '../config/config.js';

function formatInstanceSummary(name, instance, active) {
  const marker = active ? chalk.green(' (active)') : '';
  const url = instance.url || chalk.dim('(not set)');
  const database = instance.database || chalk.dim('(not set)');
  const username = instance.username || chalk.dim('(not set)');
  const password = instance.password ? chalk.green('********') : chalk.dim('(not set)');

  return `  - ${name}${marker}\n    CouchUrl: ${url}\n    DefaultDatabase: ${database}\n    CouchUsername: ${username}\n    CouchPassword: ${password}`;
}

export function setupConfigCommand(program) {
  program
    .command('config')
    .description(COMMAND.CONFIG)
    .option('-n, --name <name>', OPTION.INSTANCE_NAME)
    .option('-u, --use <name>', OPTION.USE_INSTANCE)
    .option('--couch-url <url>', OPTION.COUCH_URL)
    .option('--default-database <name>', OPTION.DEFAULT_DATABASE)
    .option('--couch-username <username>', OPTION.COUCH_USERNAME)
    .option('--couch-password <password>', OPTION.COUCH_PASSWORD)
    .option('-l, --list', OPTION.LIST)
    .option('-s, --show', OPTION.SHOW)
    .action(async (options) => {
      try {
        const hasConfigUpdate = Boolean(
          options.name ||
          options.use ||
          options.couchUrl ||
          options.defaultDatabase ||
          options.couchUsername ||
          options.couchPassword
        );

        if (options.list) {
          const instances = getInstances();
          const activeInstanceName = getActiveInstanceName();

          console.log(chalk.blue('Configured CouchDB instances:'));
          if (Object.keys(instances).length === 0) {
            console.log(chalk.dim('  No instances configured yet.'));
            return;
          }

          Object.entries(instances).forEach(([name]) => {
            const active = name === activeInstanceName;
            console.log(`  - ${name}${active ? ' (active)' : ''}`);
          });
          return;
        }

        if (!hasConfigUpdate || options.show) {
          const instances = getInstances();
          const activeInstanceName = getActiveInstanceName();

          console.log(chalk.blue('Current CLI configuration:'));
          console.log(`  Active instance: ${activeInstanceName || chalk.dim('(not set)')}`);
          console.log('  Instances:');

          if (Object.keys(instances).length === 0) {
            console.log(chalk.dim('    No instances configured yet.'));
          } else {
            Object.entries(instances).forEach(([name, instance]) => {
              const active = name === activeInstanceName;
              console.log(formatInstanceSummary(name, instance, active));
            });
          }

          if (!hasConfigUpdate) {
            return;
          }
        }

        await saveConfig({
          name: options.name,
          use: options.use,
          couchUrl: options.couchUrl,
          defaultDatabase: options.defaultDatabase,
          couchUsername: options.couchUsername,
          couchPassword: options.couchPassword
        });

        console.log(chalk.green('✓ Config updated successfully.'));
        console.log(`  Active instance: ${getActiveInstanceName()}`);
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}
