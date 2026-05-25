import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import os from 'os';

const configDirectory = process.env.LOCALAPPDATA
  ? join(process.env.LOCALAPPDATA, 'couch-bridge')
  : process.env.XDG_CONFIG_HOME
    ? join(process.env.XDG_CONFIG_HOME, 'couch-bridge')
    : join(os.homedir(), '.config', 'couch-bridge');
const configPath = join(configDirectory, 'config.json');

const defaultConfig = {
  version: '0.2.3',
  couchdb: {
    url: '',
    username: '',
    password: '',
    database: ''
  },
  batchSize: 100
};

let config = { ...defaultConfig, couchdb: { ...defaultConfig.couchdb } };

function loadConfig() {
  if (!existsSync(configPath)) {
    return;
  }

  const raw = readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw || '{}');

  config = {
    ...defaultConfig,
    ...parsed,
    couchdb: {
      ...defaultConfig.couchdb,
      ...(parsed.couchdb || {})
    }
  };
}

function ensureConfigDirectory() {
  if (!existsSync(configDirectory)) {
    mkdirSync(configDirectory, { recursive: true });
  }
}

export function ensureConfigFile() {
  if (!existsSync(configPath)) {
    ensureConfigDirectory();
    writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2) + '\n', 'utf8');
    config = { ...defaultConfig, couchdb: { ...defaultConfig.couchdb } };
  }
}

export function validateConfig() {
  const missing = [];

  if (!config.couchdb.url) {
    missing.push('CouchUrl');
  }
  if (!config.couchdb.database) {
    missing.push('DefaultDatabase');
  }
  if (!config.couchdb.username) {
    missing.push('CouchUsername');
  }
  if (!config.couchdb.password) {
    missing.push('CouchPassword');
  }

  return missing;
}

function normalizeValue(value) {
  return value == null ? '' : String(value).trim();
}

export function saveConfig(updates = {}) {
  const nextConfig = {
    ...config,
    couchdb: {
      ...config.couchdb,
      url: updates.CouchUrl != null ? normalizeValue(updates.CouchUrl) : config.couchdb.url,
      username: updates.CouchUsername != null ? normalizeValue(updates.CouchUsername) : config.couchdb.username,
      password: updates.CouchPassword != null ? normalizeValue(updates.CouchPassword) : config.couchdb.password,
      database: updates.DefaultDatabase != null ? normalizeValue(updates.DefaultDatabase) : config.couchdb.database
    }
  };

  ensureConfigDirectory();
  writeFileSync(configPath, JSON.stringify(nextConfig, null, 2) + '\n', 'utf8');
  config = nextConfig;
}

loadConfig();

export default config;
