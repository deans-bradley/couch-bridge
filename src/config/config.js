import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config as _config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

_config({ path: resolve(__dirname, `./.env`), quiet: true });

const config = {
  couchdb: {
    url: process.env.COUCHDB_URL,
    username: process.env.COUCHDB_USERNAME,
    password: process.env.COUCHDB_PASSWORD,
    database: process.env.COUCHDB_DATABASE,
  }
};

export default config;
