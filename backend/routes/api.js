const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all rooms
router.get('/room', (req, res) => {
  try {
    const rooms = Room.findAll();
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room by code
router.get('/get-room', (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).json({ error: 'Code parameter not found in request' });
  }
  
  try {
    const room = Room.findByCode(code);
    
    if (!room) {
      return res.status(404).json({ error: 'Room Not Found: Invalid Room Code' });
    }
    
    const isHost = req.sessionID === room.host;
    res.json({
      ...room,
      is_host: isHost
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create room
router.post('/create-room', (req, res) => {
  const { guest_can_pause, votes_to_skip } = req.body;
  
  if (guest_can_pause === undefined || votes_to_skip === undefined) {
    return res.status(400).json({ error: 'Invalid data...' });
  }
  
  try {
    // Check if user already has a room
    const existingRoom = Room.findByHost(req.sessionID);
    
    if (existingRoom) {
      // Update existing room
      const updated = Room.update(existingRoom.code, {
        guest_can_pause,
        votes_to_skip
      });
      req.session.room_code = updated.code;
      return res.json(updated);
    } else {
      // Create new room
      const room = Room.create(req.sessionID, guest_can_pause, votes_to_skip);
      req.session.room_code = room.code;
      return res.status(201).json(room);
    }
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join room

//req.session.room_code = code; I used server-side sessions insteads of JWTs because
//for this simple use case the automatic cleanup is very useful.
//ss-sessions works well with my "room membership" concept
router.post('/join-room', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Invalid post data, did not find a code key' });
  }
  
  try {
    const room = Room.findByCode(code);
    
    if (!room) {
      return res.status(400).json({ error: 'Invalid Room Code' });
    }
    
    req.session.room_code = code;
    res.json({ message: 'Room Joined!' });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user is in room
router.get('/user-in-room', (req, res) => {
  res.json({
    code: req.session.room_code || null
  });
});

// Leave room
router.post('/leave-room', (req, res) => {
  if (req.session.room_code) {
    const roomCode = req.session.room_code;
    delete req.session.room_code;
    
    // If user is the host, delete the room
    try {
      const room = Room.findByCode(roomCode);
      if (room && room.host === req.sessionID) {
        Room.delete(roomCode);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }
  
  res.json({ message: 'Success' });
});

// Update room
router.patch('/update-room', (req, res) => {
  const { guest_can_pause, votes_to_skip, code } = req.body;
  
  if (guest_can_pause === undefined || votes_to_skip === undefined || !code) {
    return res.status(400).json({ error: 'Invalid Data...' });
  }
  
  try {
    const room = Room.findByCode(code);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }
    
    if (room.host !== req.sessionID) {
      return res.status(403).json({ error: 'You are not the host of this room.' });
    }
    
    const updated = Room.update(code, {
      guest_can_pause,
      votes_to_skip
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

