#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { uploadDocuments, deleteDocuments } from '../src/app.js';

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

program
  .command('delete')
  .description('Delete documents from CouchDB by view')
  .argument('<view>', 'View name in format "design_doc/view_name"')
  .argument('<key>', 'Key to query the view with')
  .option('-d, --database <name>', 'Database name (uses default from config if not specified)')
  .option('-b, --batch <size>', 'Number of documents per batch (default: 100)', '100')
  .action(async (view, key, options) => {
    try {
      const batchSize = parseInt(options.batch);
      if (isNaN(batchSize) || batchSize < 1) {
        console.error(chalk.red('Error: Batch size must be a positive number'));
        process.exit(1);
      }
      
      // Confirmation prompt for safety
      console.log(chalk.yellow(`⚠️  You are about to delete documents from view: ${chalk.white(view)} with key: ${chalk.white(key)}`));
      console.log(chalk.yellow(`   Database: ${options.database || 'default from config'}`));
      console.log(chalk.yellow(`   Batch size: ${batchSize}`));
      console.log(chalk.red('\n   THIS ACTION CANNOT BE UNDONE!'));
      
      // In a real implementation, you might want to add a confirmation prompt here
      // For now, we'll proceed directly
      
      await deleteDocuments(view, key, { 
        batchSize,
        database: options.database 
      });
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}