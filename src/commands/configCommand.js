import chalk from 'chalk';
import { COMMAND, OPTION } from '../constants/description.js';
import config, { saveConfig } from '../config/config.js';

export function setupConfigCommand(program) {
  program
    .command('config')
    .description(COMMAND.CONFIG)
    .option('--couch-url <url>', OPTION.COUCH_URL)
    .option('--default-database <name>', OPTION.DEFAULT_DATABASE)
    .option('--couch-username <username>', OPTION.COUCH_USERNAME)
    .option('--couch-password <password>', OPTION.COUCH_PASSWORD)
    .option('-s, --show', OPTION.SHOW)
    .action(async (options) => {
      try {
        const updates = {};

        if (options.couchUrl) {
          updates.CouchUrl = options.couchUrl;
        }
        if (options.defaultDatabase) {
          updates.DefaultDatabase = options.defaultDatabase;
        }
        if (options.couchUsername) {
          updates.CouchUsername = options.couchUsername;
        }
        if (options.couchPassword) {
          updates.CouchPassword = options.couchPassword;
        }

        if (options.show || Object.keys(updates).length === 0) {
          console.log(chalk.blue('Current CLI configuration:'));
          console.log(`  CouchUrl: ${config.couchdb.url || chalk.dim('(not set)')}`);
          console.log(`  DefaultDatabase: ${config.couchdb.database || chalk.dim('(not set)')}`);
          console.log(`  CouchUsername: ${config.couchdb.username || chalk.dim('(not set)')}`);
          console.log(`  CouchPassword: ${config.couchdb.password ? chalk.green('********') : chalk.dim('(not set)')}`);

          if (Object.keys(updates).length === 0) {
            return;
          }
        }

        await saveConfig(updates);

        console.log(chalk.green('✓ Config updated successfully.'));
        console.log(`  CouchUrl: ${updates.CouchUrl || config.couchdb.url || chalk.dim('(unchanged)')}`);
        console.log(`  DefaultDatabase: ${updates.DefaultDatabase || config.couchdb.database || chalk.dim('(unchanged)')}`);
        console.log(`  CouchUsername: ${updates.CouchUsername || config.couchdb.username || chalk.dim('(unchanged)')}`);
        console.log(`  CouchPassword: ${updates.CouchPassword ? chalk.green('********') : chalk.dim('(unchanged)')}`);
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}
