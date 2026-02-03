import chalk from 'chalk';
import { Command } from 'commander';
import { COMMAND, ARGUMENT, OPTION } from '../constants/description.js';
import InsertManager from '../managers/InsertManager.js';

/**
 * 
 * @param {Command} program
 * @param {InsertManager} insertManager
 */
export function setupInsertCommand(program, insertManager) {
  const insertCommand = program;
  
  insertCommand
    .command('insert')
    .description(COMMAND.INSERT)
    .argument('<input>', ARGUMENT.INPUT)
    .option('-b, --batch-size <size>', OPTION.BATCH_SIZE)
    .option('-d, --database <name>', OPTION.DATABASE)
    .action(async (input, options) => {
      try {
        const batchSize = parseInt(options.batchSize);
        if (!isNaN(batchSize) && batchSize < 1) {
          console.error(chalk.red('Error: Batch size must be a positive number'));
          process.exit(1);
        }
        
        await insertManager.insert(input, {
          batchSize,
          database: options.database
        });
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}