const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const spotifyRoutes = require('./routes/spotify');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: true, // Create session even if not modified
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'sessionId' // Custom session name
}));

// Routes
app.use('/api', apiRoutes);
app.use('/spotify', spotifyRoutes);

// Serve static files from frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use('/static', express.static(path.join(frontendPath, 'static')));

// Serve the React app for all routes (client-side routing)
// But exclude API and Spotify routes
app.get('*', (req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/') || req.path.startsWith('/spotify/')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'templates', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend served from: ${frontendPath}`);
  console.log('\nNote: Make sure to initialize the database by running: npm run init-db');
});

