const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "local";
dotenv.config({ path: path.resolve(__dirname, `./.env.${env}`) });

const config = {
  env: env,
  couchdb: {
    url: process.env.COUCHDB_URL,
    username: process.env.COUCHDB_USERNAME,
    password: process.env.COUCHDB_PASSWORD,
    database: process.env.COUCHDB_DATABASE,
  }
};

module.exports = config;
