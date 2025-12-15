import chalk from 'chalk';
import { COMMAND, ARGUMENT, OPTION } from '../constants/description.js';

export function setupWhereCommand(program, whereManager) {
  const whereCommand = program;
  
  whereCommand
    .command('where')
    .description(COMMAND.WHERE)
    .argument('<view>', ARGUMENT.VIEW)
    .argument('<prop>', ARGUMENT.PROPERTY_NAME)
    .option('-k', '--key <key>', )
    .option('-v', '--value <value>', OPTION.PROPERTY_VALUE)
    .option('-d, --database <name>', OPTION.DATABASE)
    .action(async (view, prop, options) => {
      try {
        const result = await whereManager.where(view, prop, {
          key: options.key,
          propValue: options.value,
          database: options.database
        });

        if (!result.success) {
          console.error(chalk.red('Error:'), result.message);
          process.exit(1);
        }

        // Display results
        console.log(chalk.green('✓'), result.message);
        
        if (result.documents && result.documents.length > 0) {
          if (options.value) {
            // Show matching documents when filtering by specific value
            console.log(chalk.blue(`\nDocuments where '${prop}' = '${options.value}':`));
            result.documents.forEach((doc, index) => {
              console.log(chalk.gray(`${index + 1}.`), doc._id || 'No ID');
            });
          } else if (result.groups) {
            // Show value distribution when no specific value provided
            console.log(chalk.blue(`\nValue distribution for property '${prop}':`));
            result.groups.forEach(group => {
              const displayValue = group.value === null ? chalk.italic('null') : 
                                 group.value === undefined ? chalk.italic('undefined') : 
                                 chalk.yellow(group.value);
              console.log(`  ${displayValue}: ${chalk.cyan(group.count)} document(s)`);
            });
            
            if (result.summary) {
              console.log(chalk.blue('\nSummary:'));
              console.log(`  Total documents: ${chalk.cyan(result.summary.totalDocuments)}`);
              console.log(`  Unique values: ${chalk.cyan(result.summary.uniqueValues)}`);
              console.log(`  Identical values: ${chalk.cyan(result.summary.totalDocuments - result.summary.uniqueValues)}`)
            }
          }
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
        process.exit(1);
      }
    });
}