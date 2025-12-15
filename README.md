# CouchBridge

A powerful Node.js CLI tool for efficient CouchDB operations including bulk inserts, deletes, and document queries.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js->=22.14.0-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-0.2.1-blue.svg)](https://github.com/deans-bradley/couch-bridge)

## Features

- **Bulk Insert Operations** - Uses CouchDB's `_bulk_docs` endpoint for maximum performance
- **Bulk Delete Operations** - Efficiently delete documents by view queries
- **Document Querying** - Filter and analyze documents by property values
- **Smart Batching** - Automatically splits large datasets into manageable batches
- **Database Selection** - Work with any database, with configurable defaults
- **Detailed Progress Tracking** - Batch-by-batch progress with success/failure counts
- **View Integration** - Leverage CouchDB views for efficient queries and operations

## Installation

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

Create your configuration using a `.env` file in the `src/config/` directory:

```env
COUCHDB_URL=http://localhost:5984
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=your_password
COUCHDB_DATABASE=your_default_database
```

**Configuration Options:**
- `COUCHDB_URL` - Your CouchDB server URL
- `COUCHDB_USERNAME` - CouchDB username for authentication
- `COUCHDB_PASSWORD` - CouchDB password for authentication  
- `COUCHDB_DATABASE` - Default database name (can be overridden with `-d` option)

## Usage

### Document Insert Operations

#### Basic Upload
Upload documents from a JSON file to your default database:
```bash
cb insert documents.json
```

#### Upload to Specific Database
```bash
cb insert documents.json --database my_other_db
cb insert documents.json -d production_data
```

#### Custom Batch Size
Adjust batch size for performance tuning or memory constraints:
```bash
# Larger batches for better performance (default: 100)
cb insert large-dataset.json --batch-size 500

# Smaller batches for memory-constrained environments
cb insert documents.json -b 25
```

### Document Delete Operations

#### Delete by View
Delete documents using CouchDB views:
```bash
# Delete documents from a view
cb delete design_doc/view_name

# Delete with specific key
cb delete design_doc/view_name --key "user123"

# Custom batch size and database
cb delete design_doc/view_name -k "user123" -d my_db -b 50
```

### Document Query Operations

#### Query by Property Value
Filter and analyze documents by property values:
```bash
# Show all documents with a specific property value
cb where design_doc/view_name status --value "active"

# Show value distribution for a property (no --value specified)
cb where design_doc/view_name status

# Query with specific view key
cb where design_doc/view_name status --key "user123" --value "active"
```

### Combined Options Examples

```bash
# Insert with custom settings
cb insert data.json -d test_db -b 200

# Delete with custom settings  
cb delete user_docs/by_status -k "inactive" -d user_db -b 100

# Query specific database
cb where user_docs/by_status status -d production_db
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

### `cb delete`

Delete documents from CouchDB using view queries with bulk operations.

**Syntax:**
```bash
cb delete <view> [options]
```

**Arguments:**
- `<view>` - View name in format "design_doc/view_name"

**Options:**
- `-k, --key <key>` - The key value to query the view
- `-d, --database <name>` - Target database name (uses config default if not specified)
- `-b, --batch <size>` - Number of documents per batch (default: 100)
- `-h, --help` - Display help for command

**Examples:**
```bash
# Delete all documents from a view
cb delete user_docs/by_status

# Delete documents with specific key
cb delete user_docs/by_status --key "inactive"

# Custom batch size and database
cb delete user_docs/by_status -k "expired" -d cleanup_db -b 50
```

### `cb where`

Filter and analyze documents by property values using CouchDB views.

**Syntax:**
```bash
cb where <view> <property> [options]
```

**Arguments:**
- `<view>` - View name in format "design_doc/view_name"
- `<property>` - The property name to filter by

**Options:**
- `-k, --key <key>` - The key value to query the view
- `-v, --value <value>` - The property value to filter by (omit to see value distribution)
- `-d, --database <name>` - Target database name (uses config default if not specified)
- `-h, --help` - Display help for command

**Examples:**
```bash
# Show value distribution for a property
cb where user_docs/all status

# Filter documents by specific property value
cb where user_docs/all status --value "active"

# Query with specific view key
cb where user_docs/by_region status --key "us-east" --value "active"

# Query specific database
cb where user_docs/all status -d production_db
```

## Output Examples

### Successful Insert Operation

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

### Delete Operation Output

```
Querying view: user_docs/by_status with key: inactive
Found 45 documents to delete
Processing deletion in 1 batch(es) of size 100...

Processing batch 1/1 (45 documents)...
✓ Batch 1: 43 successful, 2 failed
  Errors in batch 1:
    - Document user_123: conflict (Document update conflict)
    - Document user_456: not_found (Document not found)

Deletion Summary:
  Total documents: 45
  Successful: 43
  Failed: 2
  Success rate: 95.6%
```

### Where Query Output

```
# Value distribution query
✓ Successfully queried 1,250 documents from view user_docs/all

Value distribution for property 'status':
  active: 892 document(s)
  inactive: 234 document(s)
  pending: 98 document(s)
  null: 26 document(s)

Summary:
  Total documents: 1,250
  Unique values: 4

# Filtered query
✓ Found 892 documents where 'status' = 'active'

Documents where 'status' = 'active':
1. user_001
2. user_003
3. user_007
... (showing first 3 of 892 matches)
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

**View Not Found**
```bash
Error: View does not exist
```
- Ensure the design document exists
- Check view name format: "design_doc/view_name"
- Verify the view is properly defined in the design document

**Memory Issues with Large Operations**
```bash
Error: JavaScript heap out of memory
```
- Reduce batch size: `cb insert file.json -b 50`
- Use smaller batch sizes for delete operations: `cb delete view -b 25`
- Process operations in smaller chunks

**No Documents Found**
```bash
Error: No documents found matching criteria
```
- Verify the view key exists
- Check that documents exist for the specified property value
- Ensure the view emits the expected data

## Dependencies

- **commander** - CLI framework and command parsing
- **nano** - CouchDB client library
- **chalk** - Colored console output and formatting
- **dotenv** - Environment variable configuration management

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request
