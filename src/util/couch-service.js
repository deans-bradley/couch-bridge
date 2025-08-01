const couch = require('./couch-client');

const couchService = {
  uploadDocument: async (document) => {
    return new Promise((resolve, reject) => {
      couch.insert(document, (err, body) => {
        if (err) {
          const response = {
            success: false,
            message: 'Failed to upload document',
            error: err
          };
          reject(response);
        } else {
          const response = {
            id: body.id,
            success: true,
            message: 'Document uploaded successfully'
          };
          resolve(response);
        }
      });
    });
  } 
};

module.exports = couchService;