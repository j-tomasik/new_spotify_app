const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite3');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create Rooms table
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    host TEXT NOT NULL UNIQUE,
    guest_can_pause INTEGER NOT NULL DEFAULT 0,
    votes_to_skip INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_song TEXT
  )
`);

// Create SpotifyTokens table
db.exec(`
  CREATE TABLE IF NOT EXISTS spotify_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    refresh_token TEXT NOT NULL,
    access_token TEXT NOT NULL,
    expires_in DATETIME NOT NULL,
    token_type TEXT NOT NULL
  )
`);

// Create Votes table
db.exec(`
  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    song_id TEXT NOT NULL,
    room_id INTEGER NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE(user, song_id, room_id)
  )
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
  CREATE INDEX IF NOT EXISTS idx_rooms_host ON rooms(host);
  CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user ON spotify_tokens(user);
  CREATE INDEX IF NOT EXISTS idx_votes_room_song ON votes(room_id, song_id);
`);

console.log('Database initialized successfully!');
db.close();

