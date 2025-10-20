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

export async function downloadDocuments(database = null, view = null, includeDocs = false, limit = 100) {
  return new Promise((resolve, reject) => {
    const couch = database ? couchClient.use(database) : couchClient;
    // TODO
  });
}

export async function getDocumentsByView(database = null, view, key) {
  return new Promise((resolve, reject) => {
    const couch = database ? couchClient.use(database) : couchClient;
    
    const viewQuery = {
      include_docs: true,
      key: key
    };

    couch.view(view.split('/')[0], view.split('/')[1], viewQuery, (err, body) => {
      if (err) {
        reject({
          success: false,
          message: 'Failed to query view',
          error: err.error || err.message || err
        });
      } else {
        const documents = body.rows.map(row => ({
          _id: row.doc._id,
          _rev: row.doc._rev,
          _deleted: true
        }));
        
        resolve({
          success: true,
          documents: documents,
          total: documents.length
        });
      }
    });
  });
}

export async function bulkDeleteDocuments(documents, database = null) {
  return new Promise((resolve, reject) => {
    const couch = database ? couchClient.use(database) : couchClient;
    const bulkPayload = {
      docs: documents.map(doc => ({
        _id: doc._id,
        _rev: doc._rev,
        _deleted: true
      }))
    };

    couch.bulk(bulkPayload, (err, body) => {
      if (err) {
        reject({
          success: false,
          message: 'Failed to bulk delete documents',
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
          message: `Bulk delete completed: ${results.successful.length} successful, ${results.failed.length} failed`,
          results: results
        });
      }
    });
  });
}