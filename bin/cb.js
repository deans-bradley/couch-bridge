#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { uploadDocuments } from '../src/app.js';

const program = new Command();

program
  .name('cb')
  .description('Execute bulk operations in CouchDB')
  .version('1.0.0');

program
  .command('insert')
  .description('Upload documents to CouchDB')
  .argument('<input>', 'Input JSON file path')
  .option('-b, --batch-size <size>', 'Number of documents per batch (default: 100)', '100')
  .option('-d, --database <name>', 'Database name (uses default from config if not specified)')
  .action(async (input, options) => {
    try {
      const batchSize = parseInt(options.batchSize);
      if (isNaN(batchSize) || batchSize < 1) {
        console.error(chalk.red('Error: Batch size must be a positive number'));
        process.exit(1);
      }
      
      await uploadDocuments(input, { 
        batchSize,
        database: options.database 
      });
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// TODO
program
  .command('save')
  .description('Save documents from CouchDB to local file')
  .option('-p, --path <path>', 'Custom path to save the result')
  .option('-d, --database <name>', 'Database name (uses default from config if not specified)')
  .option('-v, --view <view>', 'The name of the view in CouchDB')
  .option('-i, --include', 'Add the `include_dos` query (default: false)', 'false')
  .option('-l, --limit <limit>', 'The limit of results return (default: 100)', '100')
  .action(async (input, options) => {
    try {

    } catch (error) {

    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}