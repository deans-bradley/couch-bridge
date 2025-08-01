# CouchBridge

A powerful Node.js CLI tool for efficient bulk operations with CouchDB. CouchBridge makes it easy to upload large datasets to CouchDB with intelligent batching, detailed progress reporting, and flexible database selection.

## Features

- **True Bulk Operations** - Uses CouchDB's `_bulk_docs` endpoint for maximum performance
- **Intelligent Batching** - Automatically splits large datasets into manageable batches
- **Colored Console Output** - Easy-to-read progress reporting with chalk
- **Database Selection** - Upload to any database, with configurable defaults
- **Detailed Progress Tracking** - Batch-by-batch progress with success/failure counts
- **Robust Error Handling** - Continues processing even when individual batches fail
- **High Performance** - 100x faster than individual document uploads for large datasets

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Access to a CouchDB instance

### Setup

1. Clone or download CouchBridge
2. Install dependencies:
   ```bash
   npm install
   ```

3. Make the CLI globally accessible:
   ```bash
   npm install -g .
   ```

4. Configure your CouchDB connection (see Configuration section below)

## Configuration
Create your configuration using a `.env` in `src/config/`:

```env
COUCHDB_URL=http://localhost:5984
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=your_password
COUCHDB_DATABASE=your_default_database
```

## Usage

### Basic Upload
Upload documents from a JSON file to your default database:
```bash
cb insert documents.json
```

### Upload to Specific Database
```bash
cb insert documents.json --database my_other_db
cb insert documents.json -d production_data
```

### Custom Batch Size
Adjust batch size for performance tuning or memory constraints:
```bash
# Larger batches for better performance (default: 100)
cb insert large-dataset.json --batch-size 500

# Smaller batches for memory-constrained environments
cb insert documents.json -b 25
```

### Combined Options
```bash
cb insert data.json -d test_db -b 200
```

## Input Format

Your JSON file should contain an array of documents:

```json
[
  {
    "_id": "doc1",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  {
    "_id": "doc2", 
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25
  }
]
```

**Notes:**
- Documents can include `_id` fields or let CouchDB auto-generate them
- Each document can have any valid JSON structure
- Large files are automatically processed in batches

## Command Reference

### `cb insert`

Upload documents to CouchDB using bulk operations.

**Syntax:**
```bash
cb insert <input> [options]
```

**Arguments:**
- `<input>` - Path to JSON file containing an array of documents

**Options:**
- `-b, --batch-size <size>` - Number of documents per batch (default: 100)
- `-d, --database <name>` - Target database name (uses config default if not specified)
- `-h, --help` - Display help for command

**Examples:**
```bash
# Basic upload
cb insert data.json

# Custom batch size
cb insert data.json --batch-size 250

# Specific database
cb insert data.json --database production_db

# Combined options
cb insert large-file.json -d test_db -b 500
```

## Output Examples

### Successful Upload
```
Starting bulk upload of 350 documents (batch size: 100) to database: my_database...
Processing 4 batch(es)...

Processing batch 1/4 (100 documents)...
✓ Batch 1: 100 successful

Processing batch 2/4 (100 documents)...
✓ Batch 2: 100 successful

Processing batch 3/4 (100 documents)...
✓ Batch 3: 98 successful, 2 failed
  Errors in batch 3:
    - Document 250: conflict (Document update conflict)
    - Document 263: bad_request (Invalid document ID)

Processing batch 4/4 (50 documents)...
✓ Batch 4: 50 successful

Upload Summary:
  Total documents: 350
  Successful: 348
  Failed: 2
  Success rate: 99.4%

2 errors occurred during upload
```

## Performance Guidelines

### Batch Size Recommendations
- **Small files (< 1,000 docs)**: Use default batch size (100)
- **Medium files (1,000 - 10,000 docs)**: Increase to 250-500
- **Large files (> 10,000 docs)**: Use 500-1,000 for optimal performance
- **Memory constrained**: Reduce to 25-50

### Performance Benefits
- **Individual uploads**: ~10-50 docs/second
- **Bulk uploads**: ~1,000-5,000 docs/second (depending on document size)
- **Network efficiency**: Reduces HTTP overhead by up to 100x

## Troubleshooting

### Common Issues

**Connection Refused**
```bash
Error: connect ECONNREFUSED 127.0.0.1:5984
```
- Check that CouchDB is running
- Verify the URL in your config
- Ensure firewall allows connections

**Authentication Failed**
```bash
Error: Name or password is incorrect
```
- Verify username/password in config
- Check that the user has appropriate permissions

**Database Not Found**
```bash
Error: Database does not exist
```
- Create the database first, or
- Check database name spelling
- Verify user has access to the database

**Memory Issues with Large Files**
```bash
Error: JavaScript heap out of memory
```
- Reduce batch size: `cb insert file.json -b 50`
- Process file in smaller chunks

## Project Structure

```
couch-bridge/
├── bin/
│   └── cb.js                 # CLI entry point
├── src/
│   ├── config/
│   │   ├── .env             # Environment variables (optional)
│   │   └── config.json      # CouchDB configuration
│   ├── util/
│   │   ├── couch-client.js  # CouchDB connection setup
│   │   └── couch-service.js # Database operations
│   └── app.js               # Core application logic
├── package.json
└── README.md
```

## Dependencies

- **commander** - CLI framework
- **nano** - CouchDB client library
- **chalk** - Colored console output

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Future Features

Potential enhancements for future versions:

- **Export/Backup**: Bulk export documents from CouchDB
- **Database Management**: Create, delete, and list databases
- **Document Updates**: Bulk update existing documents
- **CSV Support**: Import from CSV files
- **Query Operations**: Execute Mango queries from CLI
- **Replication**: Set up and manage database replication
- **Progress Bars**: Visual progress indicators for large operations
- **Dry Run Mode**: Preview operations without executing them

## License

MIT License - feel free to use and modify as needed.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your CouchDB connection and permissions
3. Try reducing batch size for memory issues
4. Check CouchDB logs for server-side errors

For feature requests or bug reports, please create an issue in the project repository.