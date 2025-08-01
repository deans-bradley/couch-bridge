import nano from 'nano';
import config from '../config/config.js';

const token = Buffer.from(`${config.couchdb.username}:${config.couchdb.password}`).toString('base64');

const couchConfig = nano({
  url: config.couchdb.url,
  requestDefaults: {
    headers: {
      Authorization: `Basic ${token}`,
    }
  }
});

const defaultCouch = couchConfig.db.use(config.couchdb.database);

defaultCouch.use = (databaseName) => {
  return couchConfig.db.use(databaseName);
};

defaultCouch.server = couchConfig;

export default defaultCouch;