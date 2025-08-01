const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, `./.env`) });

const config = {
  couchdb: {
    url: process.env.COUCHDB_URL,
    username: process.env.COUCHDB_USERNAME,
    password: process.env.COUCHDB_PASSWORD,
    database: process.env.COUCHDB_DATABASE,
  }
};

module.exports = config;
