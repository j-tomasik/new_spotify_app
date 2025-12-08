const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite3');
const db = new Database(dbPath);

class Vote {
  static findByUser(user) {
    const vote = db.prepare('SELECT * FROM votes WHERE user = ? ORDER BY created_at DESC LIMIT 1').get(user);
    return vote ? Vote.normalize(vote) : null;
  }
  
  static findByUserAndSong(user, songId) {
    const vote = db.prepare('SELECT * FROM votes WHERE user = ? AND song_id = ?').get(user, songId);
    return vote ? Vote.normalize(vote) : null;
  }

  static findByRoomAndSong(roomId, songId) {
    const votes = db.prepare('SELECT * FROM votes WHERE room_id = ? AND song_id = ?').all(roomId, songId);
    return votes.map(Vote.normalize);
  }

  static create(user, roomId, songId) {
    // Check if vote already exists (unique constraint will prevent duplicates anyway)
    const existing = Vote.findByUserAndSong(user, songId);
    if (existing) {
      return existing;
    }
    
    const stmt = db.prepare('INSERT INTO votes (user, room_id, song_id) VALUES (?, ?, ?)');
    stmt.run(user, roomId, songId);
    
    return Vote.findByUserAndSong(user, songId);
  }

  static deleteByRoomAndSong(roomId, songId) {
    const stmt = db.prepare('DELETE FROM votes WHERE room_id = ? AND song_id = ?');
    stmt.run(roomId, songId);
  }

  static deleteAllByRoom(roomId) {
    const stmt = db.prepare('DELETE FROM votes WHERE room_id = ?');
    stmt.run(roomId);
  }

  static normalize(vote) {
    return {
      id: vote.id,
      user: vote.user,
      created_at: vote.created_at,
      song_id: vote.song_id,
      room_id: vote.room_id
    };
  }
}

module.exports = Vote;

