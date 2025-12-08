# Music Controller App - Node.js/Express Version

A collaborative Spotify music controller application where users can create rooms, join via unique codes, and collaboratively control Spotify playback.

## Architecture

- **Backend**: Node.js/Express with SQLite database
- **Frontend**: React with Material-UI
- **Database**: SQLite3 (using better-sqlite3)
- **Authentication**: Session-based + Spotify OAuth

## Project Structure

```
new_spotify_app/
├── backend/              # Node.js/Express backend
│   ├── models/          # Database models (Room, SpotifyToken, Vote)
│   ├── routes/          # API routes (api.js, spotify.js)
│   ├── scripts/         # Database initialization script
│   ├── utils/           # Utility functions (Spotify API helpers)
│   ├── server.js        # Main server file
│   └── package.json     # Backend dependencies
├── frontend/            # React frontend
│   ├── src/            # React source code
│   ├── static/         # Static files (CSS, built JS)
│   ├── templates/      # HTML templates
│   └── package.json    # Frontend dependencies
└── README.md           # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Spotify Developer Account (for CLIENT_ID and CLIENT_SECRET)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your configuration:
   ```
   SECRET_KEY=your-secret-key-here
   CLIENT_ID=your-spotify-client-id
   CLIENT_SECRET=your-spotify-client-secret
   REDIRECT_URI=http://localhost:8000/spotify/redirect
   SESSION_SECRET=your-session-secret-here
   PORT=8000
   ```

5. Initialize the database:
   ```bash
   npm run init-db
   ```

6. Start the backend server:
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend (for production):
   ```bash
   npm run build
   ```

4. For development with auto-rebuild:
   ```bash
   npm run dev
   ```

### Running the Application

1. **Start the backend server** (from `backend/` directory):
   ```bash
   npm start
   ```

2. **Build and serve the frontend**:
   - The backend server will serve the frontend static files
   - Make sure you've built the frontend first: `cd frontend && npm run build`
   - Or run the frontend dev server separately (requires separate port configuration)

3. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

- `SECRET_KEY`: A secret key for your application
- `CLIENT_ID`: Your Spotify App Client ID
- `CLIENT_SECRET`: Your Spotify App Client Secret
- `REDIRECT_URI`: Must match your Spotify app redirect URI (e.g., `http://localhost:8000/spotify/redirect`)
- `SESSION_SECRET`: A secret for session management
- `PORT`: Port to run the server on (default: 8000)

## Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:8000/spotify/redirect` to Redirect URIs
4. Copy your Client ID and Client Secret to the `.env` file

## API Endpoints

### Room Management (`/api/`)

- `GET /api/room` - List all rooms
- `GET /api/get-room?code=XXX` - Get room by code
- `POST /api/create-room` - Create a new room
- `POST /api/join-room` - Join a room
- `GET /api/user-in-room` - Check if user is in a room
- `POST /api/leave-room` - Leave current room
- `PATCH /api/update-room` - Update room settings (host only)

### Spotify Integration (`/spotify/`)

- `GET /spotify/get-auth-url` - Get Spotify OAuth URL
- `GET /spotify/redirect` - OAuth callback
- `GET /spotify/is-authenticated` - Check authentication status
- `GET /spotify/current-song` - Get currently playing song
- `PUT /spotify/pause` - Pause playback
- `PUT /spotify/play` - Play/resume playback
- `POST /spotify/skip` - Skip to next song

## Database Schema

- **rooms**: Stores room information (code, host, settings, current song)
- **spotify_tokens**: Stores OAuth tokens per user
- **votes**: Tracks skip votes per song per room

## Development Notes

- The backend and frontend can run on the same port (backend serves frontend)
- Sessions are stored in memory (use Redis for production)
- Database is SQLite (migrate to PostgreSQL for production)
- CORS is configured to allow all origins in development

## Migration from Django

This application has been migrated from a Django/Python backend to Node.js/Express. Key changes:

- Django models → JavaScript classes with SQLite queries
- Django REST Framework → Express routes
- Django sessions → express-session
- Python Spotify utilities → JavaScript/axios

## Troubleshooting

- **Database errors**: Make sure you've run `npm run init-db` in the backend directory
- **Session issues**: Check that SESSION_SECRET is set in `.env`
- **Spotify auth fails**: Verify CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI match your Spotify app settings
- **Frontend not loading**: Ensure frontend has been built (`npm run build` in frontend directory)

## License

ISC

