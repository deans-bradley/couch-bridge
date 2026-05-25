#!/usr/bin/env node

import chalk from 'chalk';
import { program } from 'commander';
import config, { ensureConfigFile, validateConfig } from '../src/config/config.js';
import InsertManager from '../src/managers/InsertManager.js';
import { setupInsertCommand } from '../src/commands/insertCommand.js';
import DeleteManager from '../src/managers/DeleteManager.js';
import { setupDeleteCommand } from '../src/commands/deleteCommand.js';
import { setupWhereCommand } from '../src/commands/whereCommand.js';
import WhereManager from '../src/managers/WhereManager.js';
import { setupConfigCommand } from '../src/commands/configCommand.js';

const insertManager = new InsertManager();
const deleteManager = new DeleteManager();
const whereManager = new WhereManager();

program
  .name('cb')
  .description('Execute bulk operations in CouchDB')
  .version(config.version);

program.hook('preAction', () => {
  ensureConfigFile();

  const commandName = program.args[0];
  if (commandName === 'config') {
    return;
  }

  const missing = validateConfig();
  if (missing.length > 0) {
    console.error(chalk.red('Missing required CouchDB configuration values:'));
    missing.forEach(value => console.error(`  - ${value}`));
    console.error(chalk.yellow('Please run `cb config --couch-url <url> --couch-username <user> --couch-password <pass> --default-database <db>` to set required settings.'));
    process.exit(1);
  }
});

setupInsertCommand(program, insertManager);
setupDeleteCommand(program, deleteManager);
setupWhereCommand(program, whereManager);
setupConfigCommand(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}