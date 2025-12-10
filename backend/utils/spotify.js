const axios = require('axios');
const SpotifyToken = require('../models/SpotifyToken');
require('dotenv').config();

const BASE_URL = 'https://api.spotify.com/v1/me/';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

function getUserTokens(sessionId) {
  return SpotifyToken.findByUser(sessionId);
}

function updateOrCreateUserTokens(sessionId, accessToken, tokenType, expiresIn, refreshToken) {
  return SpotifyToken.createOrUpdate(sessionId, accessToken, tokenType, expiresIn, refreshToken);
}

function isSpotifyAuthenticated(sessionId) {
  const tokens = getUserTokens(sessionId);
  
  if (!tokens) {
    return false;
  }
  
  const expiry = new Date(tokens.expires_in);
  const now = new Date();
  

  //token lifecycle management- access tokens expire, refresh tokens don't (usually)
  if (expiry <= now) {
    refreshSpotifyToken(sessionId);
  }
  
  return true;
}

async function refreshSpotifyToken(sessionId) {
  const tokens = getUserTokens(sessionId);
  
  if (!tokens || !tokens.refresh_token) {
    return null;
  }
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, token_type, expires_in } = response.data;
    
    return updateOrCreateUserTokens(
      sessionId,
      access_token,
      token_type,
      expires_in,
      tokens.refresh_token
    );
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    return null;
  }
}

//this boilerplate function is invoked by sub-methods as defined below to execute an API call to Spotify based 
//on the args provided
async function executeSpotifyApiRequest(sessionId, endpoint, method = 'GET', data = null) {
  const tokens = getUserTokens(sessionId);
  
  if (!tokens) {
    return { error: 'No tokens found' };
  }
  
  // Check if token is expired and refresh if needed
  const expiry = new Date(tokens.expires_in);
  const now = new Date();
  if (expiry <= now) {
    await refreshSpotifyToken(sessionId);
    // Get updated tokens
    const updatedTokens = getUserTokens(sessionId);
    if (!updatedTokens) {
      return { error: 'Failed to refresh token' };
    }
  }
  
  const headers = {
    'Authorization': `Bearer ${tokens.access_token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    let response;
    const url = BASE_URL + endpoint;
    
    if (method === 'GET') {
      response = await axios.get(url, { headers });
    } else if (method === 'PUT') {
      response = await axios.put(url, data, { headers });
    } else if (method === 'POST') {
      response = await axios.post(url, data, { headers });
    }
    
    return response.data;
  } catch (error) {
    console.error('Spotify API error:', error.response?.data || error.message);
    return { error: error.response?.data?.error?.message || 'Issue with request' };
  }
}

function playSong(sessionId) {
  return executeSpotifyApiRequest(sessionId, 'player/play', 'PUT');
}

function pauseSong(sessionId) {
  return executeSpotifyApiRequest(sessionId, 'player/pause', 'PUT');
}

function skipSong(sessionId) {
  return executeSpotifyApiRequest(sessionId, 'player/next', 'POST');
}

module.exports = {
  getUserTokens,
  updateOrCreateUserTokens,
  isSpotifyAuthenticated,
  refreshSpotifyToken,
  executeSpotifyApiRequest,
  playSong,
  pauseSong,
  skipSong,
  CLIENT_ID,
  CLIENT_SECRET
};

