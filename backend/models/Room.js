const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite3');
const db = new Database(dbPath);

function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  
  while (true) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = db.prepare('SELECT COUNT(*) as count FROM rooms WHERE code = ?').get(code);
    if (existing.count === 0) {
      break;
    }
  }
  
  return code;
}

class Room {
  static create(host, guestCanPause = false, votesToSkip = 1) {
    const code = generateUniqueCode();
    const stmt = db.prepare(`
      INSERT INTO rooms (code, host, guest_can_pause, votes_to_skip)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(code, host, guestCanPause ? 1 : 0, votesToSkip);
    return Room.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(id);
    return room ? Room.normalize(room) : null;
  }

  static findByCode(code) {
    const room = db.prepare('SELECT * FROM rooms WHERE code = ?').get(code);
    return room ? Room.normalize(room) : null;
  }

  static findByHost(host) {
    const room = db.prepare('SELECT * FROM rooms WHERE host = ?').get(host);
    return room ? Room.normalize(room) : null;
  }

  static findAll() {
    const rooms = db.prepare('SELECT * FROM rooms').all();
    return rooms.map(Room.normalize);
  }

  static update(code, updates) {
    const setParts = [];
    const values = [];
    
    if (updates.guest_can_pause !== undefined) {
      setParts.push('guest_can_pause = ?');
      values.push(updates.guest_can_pause ? 1 : 0);
    }
    
    if (updates.votes_to_skip !== undefined) {
      setParts.push('votes_to_skip = ?');
      values.push(updates.votes_to_skip);
    }
    
    if (updates.current_song !== undefined) {
      setParts.push('current_song = ?');
      values.push(updates.current_song);
    }
    
    if (setParts.length === 0) {
      return Room.findByCode(code);
    }
    
    values.push(code);
    const stmt = db.prepare(`UPDATE rooms SET ${setParts.join(', ')} WHERE code = ?`);
    stmt.run(...values);
    
    return Room.findByCode(code);
  }

  static delete(code) {
    const stmt = db.prepare('DELETE FROM rooms WHERE code = ?');
    stmt.run(code);
  }

  static deleteByHost(host) {
    const stmt = db.prepare('DELETE FROM rooms WHERE host = ?');
    stmt.run(host);
  }

  static normalize(room) {
    return {
      id: room.id,
      code: room.code,
      host: room.host,
      guest_can_pause: Boolean(room.guest_can_pause),
      votes_to_skip: room.votes_to_skip,
      created_at: room.created_at,
      current_song: room.current_song
    };
  }
}

module.exports = Room;

