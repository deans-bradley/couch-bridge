#!/usr/bin/env node

const { Command } = require('commander');
const { uploadDocuments } = require('../src/app');

const program = new Command();

program
  .name('cdb')
  .description('Execute bulk operations in CouchDB')
  .version('1.0.0');

program
  .command('insert')
  .description('Upload documents to CouchDB')
  .argument('<input>', 'Input JSON file path')
  .action(async (input) => {
    try {
      uploadDocuments(input);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}