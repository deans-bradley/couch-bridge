import { promises as fs } from 'fs';
import chalk from 'chalk';
import { bulkUploadDocuments } from './util/couch-service.js';

const DEFAULT_BATCH_SIZE = 100;

export async function uploadDocuments(inputFile, options = {}) {
  const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
  const database = options.database;

  try {
    await fs.access(inputFile);

    const fileData = await fs.readFile(inputFile, 'utf8');
    let docs;

    try {
      docs = JSON.parse(fileData);
    } catch (parseErr) {
      throw new Error(`Failed to parse JSON: ${parseErr.message}`);
    }

    if (!Array.isArray(docs)) {
      throw new Error('JSON file must contain an array of documents');
    }

    console.log(chalk.blue(`Starting bulk upload of ${docs.length} documents (batch size: ${batchSize})${database ? ` to database: ${chalk.white(database)}` : ''}...`));

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
        const response = await bulkUploadDocuments(batch, database);

        totalSuccessful += response.results.successful.length;
        totalFailed += response.results.failed.length;

        if (response.results.failed.length === 0) {
          console.log(chalk.green(`✓ Batch ${batchNumber}: ${response.results.successful.length} successful`));
        } else {
          console.log(chalk.yellow(`✓ Batch ${batchNumber}: ${response.results.successful.length} successful, ${chalk.red(response.results.failed.length + ' failed')}`));
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

    console.log(chalk.cyan(`\nUpload Summary:`));
    console.log(`  Total documents: ${chalk.white(docs.length)}`);
    console.log(`  Successful: ${chalk.green(totalSuccessful)}`);
    console.log(`  Failed: ${totalFailed > 0 ? chalk.red(totalFailed) : chalk.green(totalFailed)}`);
    console.log(`  Success rate: ${chalk.white(((totalSuccessful / docs.length) * 100).toFixed(1) + '%')}`);

    if (allErrors.length > 0) {
      console.log(chalk.red(`\n${allErrors.length} errors occurred during upload`));
      if (totalFailed === docs.length) {
        throw new Error('All documents failed to upload');
      }
    } else {
      console.log(chalk.green(`\nAll documents uploaded successfully!`));
    }

    return {
      total: docs.length,
      successful: totalSuccessful,
      failed: totalFailed,
      errors: allErrors
    };

  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Input file not found: ${inputFile}`);
    }
    throw error;
  }
}

export async function downloadDocuments(options = {}) {
  // TODO
}