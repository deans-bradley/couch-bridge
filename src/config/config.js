import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config as _config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

_config({ path: resolve(__dirname, `./.env`), quiet: true });

const config = {
  version: '0.1.0',
  couchdb: {
    url: process.env.COUCHDB_URL,
    username: process.env.COUCHDB_USERNAME,
    password: process.env.COUCHDB_PASSWORD,
    database: process.env.COUCHDB_DATABASE,
  },
  batchSize: 100
};

export default config;
