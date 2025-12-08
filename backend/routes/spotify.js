const express = require('express');
const router = express.Router();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const Vote = require('../models/Vote');
const {
  updateOrCreateUserTokens,
  isSpotifyAuthenticated,
  executeSpotifyApiRequest,
  playSong,
  pauseSong,
  skipSong,
  CLIENT_ID
} = require('../utils/spotify');
require('dotenv').config();

const REDIRECT_URI = process.env.REDIRECT_URI;

// Get Spotify auth URL
router.get('/get-auth-url', (req, res) => {
  const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing';
  const state = uuidv4();
  
  req.session.spotify_state = state;
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scopes,
    redirect_uri: REDIRECT_URI,
    state: state
  });
  
  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  res.json({ url });
});

// Spotify OAuth callback
router.get('/redirect', async (req, res) => {
  const { code, error, state } = req.query;
  
  if (error) {
    return res.redirect('/?error=' + encodeURIComponent(error));
  }
  
  // Verify state
  if (state !== req.session.spotify_state) {
    return res.redirect('/?error=state_mismatch');
  }
  
  delete req.session.spotify_state;
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, token_type, expires_in, refresh_token } = response.data;
    
    updateOrCreateUserTokens(
      req.sessionID,
      access_token,
      token_type,
      expires_in,
      refresh_token
    );
    
    res.redirect('/');
  } catch (error) {
    console.error('Spotify callback error:', error.response?.data || error.message);
    res.redirect('/?error=authentication_failed');
  }
});

// Check if authenticated
router.get('/is-authenticated', (req, res) => {
  const authenticated = isSpotifyAuthenticated(req.sessionID);
  res.json({ status: authenticated });
});

// Get current song
router.get('/current-song', async (req, res) => {
  const roomCode = req.session.room_code;
  
  if (!roomCode) {
    return res.status(404).json({});
  }
  
  try {
    const room = Room.findByCode(roomCode);
    
    if (!room) {
      return res.status(404).json({});
    }
    
    const host = room.host;
    const response = await executeSpotifyApiRequest(host, 'player/currently-playing');
    
    if (response.error || !response.item) {
      return res.status(204).json({});
    }
    
    const item = response.item;
    const duration = item.duration_ms;
    const progress = response.progress_ms;
    const albumCover = item.album.images[0]?.url || '';
    const isPlaying = response.is_playing;
    const songId = item.id;
    
    let artistString = '';
    item.artists.forEach((artist, i) => {
      if (i > 0) {
        artistString += ', ';
      }
      artistString += artist.name;
    });
    
    // Get room from database to get votes
    const dbRoom = Room.findByCode(roomCode);
    const votes = Vote.findByRoomAndSong(room.id, songId);
    
    const song = {
      title: item.name,
      artist: artistString,
      duration: duration,
      time: progress,
      image_url: albumCover,
      is_playing: isPlaying,
      votes: votes.length,
      votes_required: room.votes_to_skip,
      id: songId
    };
    
    // Update room's current song if it changed
    if (dbRoom.current_song !== songId) {
      Room.update(roomCode, { current_song: songId });
      // Clear votes when song changes
      Vote.deleteAllByRoom(room.id);
    }
    
    res.json(song);
  } catch (error) {
    console.error('Error getting current song:', error);
    res.status(204).json({});
  }
});

// Pause song
router.put('/pause', async (req, res) => {
  const roomCode = req.session.room_code;
  
  if (!roomCode) {
    return res.status(404).json({});
  }
  
  try {
    const room = Room.findByCode(roomCode);
    
    if (!room) {
      return res.status(404).json({});
    }
    
    if (req.sessionID === room.host || room.guest_can_pause) {
      await pauseSong(room.host);
      return res.status(204).json({});
    }
    
    res.status(403).json({});
  } catch (error) {
    console.error('Error pausing song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Play song
router.put('/play', async (req, res) => {
  const roomCode = req.session.room_code;
  
  if (!roomCode) {
    return res.status(404).json({});
  }
  
  try {
    const room = Room.findByCode(roomCode);
    
    if (!room) {
      return res.status(404).json({});
    }
    
    if (req.sessionID === room.host || room.guest_can_pause) {
      await playSong(room.host);
      return res.status(204).json({});
    }
    
    res.status(403).json({});
  } catch (error) {
    console.error('Error playing song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Skip song
router.post('/skip', async (req, res) => {
  const roomCode = req.session.room_code;
  
  if (!roomCode) {
    return res.status(404).json({});
  }
  
  try {
    const room = Room.findByCode(roomCode);
    
    if (!room) {
      return res.status(404).json({});
    }
    
    const votes = Vote.findByRoomAndSong(room.id, room.current_song);
    const votesNeeded = room.votes_to_skip;
    const isHost = req.sessionID === room.host;
    
    if (isHost || votes.length + 1 >= votesNeeded) {
      // Skip the song
      Vote.deleteByRoomAndSong(room.id, room.current_song);
      await skipSong(room.host);
    } else {
      // Add a vote
      Vote.create(req.sessionID, room.id, room.current_song);
    }
    
    res.status(204).json({});
  } catch (error) {
    console.error('Error skipping song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

