const nano = require('nano');
const config = require('../config/config');

const token = Buffer.from(`${config.couchdb.username}:${config.couchdb.password}`).toString('base64');

const couchConfig = nano({
  url: config.couchdb.url,
  requestDefaults: {
    headers: {
      Authorization: `Basic ${token}`,
    }
  }
});

const couch = couchConfig.db.use(config.couchdb.database);
module.exports = couch;
