import couchClient from './couch-client.js';

export async function uploadDocument(document, database = null) {
  return new Promise((resolve, reject) => {
    const couch = database ? couchClient.use(database) : couchClient;
    
    couch.insert(document, (err, body) => {
      if (err) {
        reject({
          success: false,
          message: 'Failed to upload document',
          error: err.error || err.message || err
        });
      } else {
        resolve({
          id: body.id,
          success: true,
          message: 'Document uploaded successfully'
        });
      }
    });
  });
}

export async function bulkUploadDocuments(documents, database = null) {
  return new Promise((resolve, reject) => {
    const couch = database ? couchClient.use(database) : couchClient;
    const bulkPayload = {
      docs: documents
    };

    couch.bulk(bulkPayload, (err, body) => {
      if (err) {
        reject({
          success: false,
          message: 'Failed to bulk upload documents',
          error: err.error || err.message || err
        });
      } else {
        const results = {
          successful: [],
          failed: [],
          total: documents.length
        };

        body.forEach((result, index) => {
          if (result.error) {
            results.failed.push({
              index: index,
              id: result.id,
              error: result.error,
              reason: result.reason
            });
          } else {
            results.successful.push({
              index: index,
              id: result.id,
              rev: result.rev
            });
          }
        });

        resolve({
          success: results.failed.length === 0,
          message: `Bulk upload completed: ${results.successful.length} successful, ${results.failed.length} failed`,
          results: results
        });
      }
    });
  });
}