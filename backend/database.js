const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite3');

// Create a single database connection
const db = new Database(dbPath);

// Enable foreign keys, for referential integrity (votes->rooms)
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrency, multiple users checking the room
db.pragma('journal_mode = WAL');

module.exports = db;

//synchronous API makes code simpler to reason through

//low configuration, perfect for a small project
