#!/usr/bin/cb.js

import { program } from 'commander';
import config from '../src/config/config.js';
import InsertManager from '../src/managers/InsertManager.js';
import { setupInsertCommand } from '../src/commands/insertCommand.js';
import DeleteManager from '../src/managers/DeleteManager.js';
import { setupDeleteCommand } from '../src/commands/deleteCommand.js';
import { setupWhereCommand } from '../src/commands/whereCommand.js';
import WhereManager from '../src/managers/WhereManager.js';

const insertManager = new InsertManager();
const deleteManager = new DeleteManager();
const whereManager = new WhereManager();

program
  .name('cb')
  .description('Execute bulk operations in CouchDB')
  .version(config.version);

setupInsertCommand(program, insertManager);
setupDeleteCommand(program, deleteManager);
setupWhereCommand(program, whereManager);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}