import chalk from 'chalk';
import config from '../config/config.js';
import { getDocumentsByView, bulkDeleteDocuments } from '../util/couch-service.js';

class DeleteManager {

  /**
   * @param {string} view
   * @param {Object} options
   * @param {string} options.key
   * @param {number} options.batchSize
   * @param {string} options.database
   * @returns 
   */
  async delete(view, options = {}) {
    const key = options.key;
    const batchSize = options.batchSize || config.batchSize;
    const database = options.database;

    try {
      console.log(chalk.blue(`Starting bulk delete from view: ${chalk.white(view)} with key: ${chalk.white(key)}${database ? ` in database: ${chalk.white(database)}` : ''}...`));

      console.log(chalk.yellow('Fetching documents from view...'));
      const viewResponse = await getDocumentsByView(database, view, key);
      
      if (!viewResponse.success) {
        throw new Error(viewResponse.message || 'Failed to fetch documents from view');
      }

      const docs = viewResponse.documents;
      
      if (docs.length === 0) {
        console.log(chalk.yellow('No documents found for the specified view and key'));
        return {
          total: 0,
          successful: 0,
          failed: 0,
          errors: []
        };
      }

      console.log(chalk.blue(`Found ${docs.length} document(s) to delete (batch size: ${batchSize})...`));

      const batches = [];
      for (let i = 0; i < docs.length; i += batchSize) {
        batches.push(docs.slice(i, i + batchSize));
      }

      console.log(chalk.blue(`Processing ${batches.length} batch(es)...`));

      let totalSuccessful = 0;
      let totalFailed = 0;
      const allErrors = [];

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchNumber = batchIndex + 1;

        console.log(chalk.yellow(`\nProcessing batch ${batchNumber}/${batches.length} (${batch.length} documents)...`));

        try {
          const response = await bulkDeleteDocuments(batch, database);

          totalSuccessful += response.results.successful.length;
          totalFailed += response.results.failed.length;

          if (response.results.failed.length === 0) {
            console.log(chalk.green(`✓ Batch ${batchNumber}: ${response.results.successful.length} deleted`));
          } else {
            console.log(chalk.yellow(`✓ Batch ${batchNumber}: ${response.results.successful.length} deleted, ${chalk.red(response.results.failed.length + ' failed')}`));
          }

          if (response.results.failed.length > 0) {
            console.log(chalk.red(`  Errors in batch ${batchNumber}:`));
            response.results.failed.forEach(failure => {
              console.log(chalk.red(`    - Document ${failure.index + (batchIndex * batchSize)}: ${failure.error} (${failure.reason})`));
              allErrors.push({
                batch: batchNumber,
                globalIndex: failure.index + (batchIndex * batchSize),
                ...failure
              });
            });
          }

        } catch (error) {
          console.error(chalk.red(`✗ Batch ${batchNumber} failed completely: ${error.message || error.error}`));
          totalFailed += batch.length;
          allErrors.push({
            batch: batchNumber,
            error: 'Entire batch failed',
            reason: error.message || error.error
          });

          console.log(chalk.yellow(`Continuing with remaining batches...`));
        }
      }

      console.log(chalk.cyan(`\nDelete Summary:`));
      console.log(`  Total documents: ${chalk.white(docs.length)}`);
      console.log(`  Successful: ${chalk.green(totalSuccessful)}`);
      console.log(`  Failed: ${totalFailed > 0 ? chalk.red(totalFailed) : chalk.green(totalFailed)}`);
      console.log(`  Success rate: ${chalk.white(((totalSuccessful / docs.length) * 100).toFixed(1) + '%')}`);

      if (allErrors.length > 0) {
        console.log(chalk.red(`\n${allErrors.length} errors occurred during deletion`));
        if (totalFailed === docs.length) {
          throw new Error('All documents failed to delete');
        }
      } else {
        console.log(chalk.green(`\nAll documents deleted successfully!`));
      }

      return {
        total: docs.length,
        successful: totalSuccessful,
        failed: totalFailed,
        errors: allErrors
      };
    } catch (error) {
      return {
        success: false,
        message: `Error executing delete command: ${error.message}`,
        error: error.message
      };
    }
  }
}

export default DeleteManager;