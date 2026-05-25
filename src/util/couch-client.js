import nano from 'nano';
import config from '../config/config.js';

function createClient() {
  const token = Buffer.from(`${config.couchdb.username}:${config.couchdb.password}`).toString('base64');

  const couchConfig = nano({
    url: config.couchdb.url,
    requestDefaults: {
      headers: {
        Authorization: `Basic ${token}`
      }
    }
  });

  const defaultCouch = couchConfig.db.use(config.couchdb.database);
  defaultCouch.use = (databaseName) => couchConfig.db.use(databaseName);
  defaultCouch.server = couchConfig;
  return defaultCouch;
}

let couchClient = null;

function ensureClient() {
  if (!couchClient) {
    if (!config.couchdb.url || !config.couchdb.username || !config.couchdb.password || !config.couchdb.database) {
      throw new Error('CouchDB client is not configured. Run `cb config` to set CouchUrl, CouchUsername, CouchPassword, and DefaultDatabase.');
    }
    couchClient = createClient();
  }
  return couchClient;
}

const proxy = new Proxy({}, {
  get(_, prop) {
    const client = ensureClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export default proxy;