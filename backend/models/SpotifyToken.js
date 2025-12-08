const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite3');
const db = new Database(dbPath);

class SpotifyToken {
  static findByUser(user) {
    const token = db.prepare('SELECT * FROM spotify_tokens WHERE user = ?').get(user);
    return token ? SpotifyToken.normalize(token) : null;
  }

  static createOrUpdate(user, accessToken, tokenType, expiresIn, refreshToken) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    const existing = db.prepare('SELECT id FROM spotify_tokens WHERE user = ?').get(user);
    
    if (existing) {
      const stmt = db.prepare(`
        UPDATE spotify_tokens 
        SET access_token = ?, refresh_token = ?, expires_in = ?, token_type = ?
        WHERE user = ?
      `);
      stmt.run(accessToken, refreshToken, expiresAt, tokenType, user);
    } else {
      const stmt = db.prepare(`
        INSERT INTO spotify_tokens (user, access_token, refresh_token, expires_in, token_type)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(user, accessToken, refreshToken, expiresAt, tokenType);
    }
    
    return SpotifyToken.findByUser(user);
  }

  static normalize(token) {
    return {
      id: token.id,
      user: token.user,
      created_at: token.created_at,
      refresh_token: token.refresh_token,
      access_token: token.access_token,
      expires_in: token.expires_in,
      token_type: token.token_type
    };
  }
}

module.exports = SpotifyToken;

