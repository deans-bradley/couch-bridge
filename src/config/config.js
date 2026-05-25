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
  version: '0.4.0',
  activeInstance: '',
  instances: {},
  batchSize: 100
};

let config = { ...defaultConfig };

function normalizeValue(value) {
  return value == null ? '' : String(value).trim();
}

function loadConfig() {
  if (!existsSync(configPath)) {
    return;
  }

  const raw = readFileSync(configPath, 'utf8');
  const parsed = JSON.parse(raw || '{}');

  const loaded = {
    ...defaultConfig,
    ...parsed,
    instances: typeof parsed.instances === 'object' && parsed.instances !== null ? { ...parsed.instances } : {}
  };

  if (!loaded.activeInstance && parsed.couchdb && Object.keys(loaded.instances).length === 0) {
    loaded.instances = {
      default: {
        url: normalizeValue(parsed.couchdb.url),
        username: normalizeValue(parsed.couchdb.username),
        password: normalizeValue(parsed.couchdb.password),
        database: normalizeValue(parsed.couchdb.database)
      }
    };
    loaded.activeInstance = 'default';
  }

  if (!loaded.activeInstance && Object.keys(loaded.instances).length > 0) {
    loaded.activeInstance = Object.keys(loaded.instances)[0];
  }

  config = loaded;
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
    config = { ...defaultConfig };
  }
}

export function getActiveInstanceName() {
  return config.activeInstance;
}

export function getActiveInstance() {
  if (!config.activeInstance) {
    return null;
  }

  return config.instances[config.activeInstance] || null;
}

export function getInstances() {
  return { ...config.instances };
}

export function getInstance(instanceName) {
  return config.instances[instanceName] || null;
}

export function validateConfig() {
  const activeInstanceName = config.activeInstance;
  const missing = [];

  if (!activeInstanceName) {
    missing.push('ActiveInstance');
    return missing;
  }

  const activeInstance = getActiveInstance();
  if (!activeInstance) {
    missing.push(`Instance "${activeInstanceName}"`);
    return missing;
  }

  if (!activeInstance.url) {
    missing.push('CouchUrl');
  }
  if (!activeInstance.database) {
    missing.push('DefaultDatabase');
  }
  if (!activeInstance.username) {
    missing.push('CouchUsername');
  }
  if (!activeInstance.password) {
    missing.push('CouchPassword');
  }

  return missing;
}

export function saveConfig({ name, use, couchUrl, defaultDatabase, couchUsername, couchPassword } = {}) {
  const instanceName = normalizeValue(name || config.activeInstance || 'default');
  const nextInstances = { ...config.instances };

  if (!nextInstances[instanceName]) {
    nextInstances[instanceName] = {
      url: '',
      username: '',
      password: '',
      database: ''
    };
  }

  const instance = nextInstances[instanceName];
  nextInstances[instanceName] = {
    url: couchUrl != null ? normalizeValue(couchUrl) : instance.url,
    username: couchUsername != null ? normalizeValue(couchUsername) : instance.username,
    password: couchPassword != null ? normalizeValue(couchPassword) : instance.password,
    database: defaultDatabase != null ? normalizeValue(defaultDatabase) : instance.database
  };

  let activeInstance = config.activeInstance;
  if (use) {
    const normalizedUse = normalizeValue(use);
    if (!nextInstances[normalizedUse]) {
      throw new Error(`Instance "${normalizedUse}" does not exist. Create it with --name first.`);
    }
    activeInstance = normalizedUse;
  } else if (!activeInstance) {
    activeInstance = instanceName;
  }

  const nextConfig = {
    ...config,
    activeInstance,
    instances: nextInstances
  };

  ensureConfigDirectory();
  writeFileSync(configPath, JSON.stringify(nextConfig, null, 2) + '\n', 'utf8');
  config = nextConfig;
}

loadConfig();

export default config;
