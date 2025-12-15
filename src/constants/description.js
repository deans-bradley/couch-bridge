// constants/description.js

const COMMAND = Object.freeze({
  DELETE: 'Delete documents from CouchDB by view',
  INSERT: 'Upload documents to CouchDB',
  WHERE: 'Filter documents by a specific property value. If no value is provided, then all documents with the same value for the specified property will be returned'
});

const ARGUMENT = Object.freeze({
  INPUT: 'Input JSON file path',
  PROPERTY_NAME: 'The property name',
  VIEW: 'View name in format "design_doc/view_name"'
});

const OPTION = Object.freeze({
  BATCH_SIZE: 'Number of documents per batch (default: 100)',
  DATABASE: 'Database name (uses default from config if not specified)',
  KEY: 'The key value to query the view',
  PROPERTY_VALUE: 'The property value'
});

export {
  COMMAND,
  ARGUMENT,
  OPTION
};
