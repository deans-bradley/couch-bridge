const fs = require('fs');
const couchService = require('./util/couch-service');

async function uploadDocuments(inputFile) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            reject(new Error(`Input file not found: ${inputFile}`));
            return;
        }

        fs.readFile(inputFile, 'utf8', async (err, fileData) => {
            if (err) {
                reject(err);
                return;
            }
            let docs = [];
            try {
                docs = JSON.parse(fileData);
            } catch (parseErr) {
                reject(new Error(`Failed to parse JSON: ${parseErr.message}`));
                return;
            }

            docs.forEach(async doc => {
                const response = await couchService.uploadDocument(doc);

                if (!response.success) {
                    console.log('An Error occured. Stopping upload.');
                    console.log(response.error);
                    reject(response.error);
                    return;
                }
            });
        });
        resolve();
    });
}
module.exports = { uploadDocuments };