import chalk from 'chalk';
import { Command } from 'commander';
import { COMMAND, ARGUMENT, OPTION } from '../constants/description.js';
import DeleteManager from '../managers/DeleteManager.js';

/**
 * @param {Command} program 
 * @param {DeleteManager} deleteManager
 */
export function setupDeleteCommand(program, deleteManager) {
  /** @type {Command} */
  const deleteCommand = program;
  
  deleteCommand
    .command('delete')
    .description(COMMAND.DELETE)
    .argument('<view>', ARGUMENT.VIEW)
    .option('-k, --key <key>', OPTION.KEY)
    .option('-d, --database <name>', OPTION.DATABASE)
    .option('-b, --batch <size>', OPTION.BATCH_SIZE, '100')
    .action(async (view, options) => {
      try {
        const batchSize = parseInt(options.batch);
        if (isNaN(batchSize) || batchSize < 1) {
          console.error(chalk.red('Error: Batch size must be a positive number'));
          process.exit(1);
        }
        
        console.log(chalk.yellow(`   Database: ${options.database || 'default from config'}`));
        console.log(chalk.yellow(`   Batch size: ${batchSize}`));
        
        await deleteManager.delete(view, {
          key: options.key,
          batchSize: options.batchSize,
          database: options.database
        });
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}