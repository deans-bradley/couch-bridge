import chalk from 'chalk';
import { COMMAND, ARGUMENT, OPTION } from '../constants/description.js';

export function setupDeleteCommand(program, deleteManager) {
  const deleteCommand = program;
  
  deleteCommand
    .command('delete')
    .description(COMMAND.DELETE)
    .argument('<view>', ARGUMENT.VIEW)
    .option('-k', '--key <key>', OPTION.KEY)
    .option('-d, --database <name>', OPTION.DATABASE)
    .option('-b, --batch <size>', OPTION.BATCH_SIZE, '100')
    .action(async (input, options) => {
      try {
        const batchSize = parseInt(options.batch);
        if (isNaN(batchSize) || batchSize < 1) {
          console.error(chalk.red('Error: Batch size must be a positive number'));
          process.exit(1);
        }
        
        console.log(chalk.yellow(`   Database: ${options.database || 'default from config'}`));
        console.log(chalk.yellow(`   Batch size: ${batchSize}`));
        
        await deleteManager.delete(view, key, { 
          batchSize,
          database: options.database 
        });
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}