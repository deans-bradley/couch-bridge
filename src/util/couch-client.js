import nano from 'nano';
import config, { getActiveInstance } from '../config/config.js';

function createClient(instance) {
  const token = Buffer.from(`${instance.username}:${instance.password}`).toString('base64');

  const couchConfig = nano({
    url: instance.url,
    requestDefaults: {
      headers: {
        Authorization: `Basic ${token}`
      }
    }
  });

  const defaultCouch = couchConfig.db.use(instance.database);
  defaultCouch.use = (databaseName) => couchConfig.db.use(databaseName);
  defaultCouch.server = couchConfig;
  return defaultCouch;
}

function ensureClient() {
  const activeInstance = getActiveInstance();

  if (!config.activeInstance || !activeInstance) {
    throw new Error('No active CouchDB instance is configured. Run `cb config --list` and `cb config --use <name>` to select an active instance.');
  }

  if (!activeInstance.url || !activeInstance.username || !activeInstance.password || !activeInstance.database) {
    throw new Error('The active CouchDB instance is missing required settings. Run `cb config --show` and update the active instance.');
  }

  return createClient(activeInstance);
}

const proxy = new Proxy({}, {
  get(_, prop) {
    const client = ensureClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export default proxy;