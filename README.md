An immersive React application that analyzes your mood through natural conversation and recommends personalized music with dynamic nature backgrounds and ambient audio.
Features

Voice-based conversation using the Web Speech API
Advanced mood analysis that detects emotional states from natural language
Music recommendations from Spotify or YouTube Music based on detected mood
Dynamic nature backgrounds that change to match your emotional state
Ambient background music at low volume to enhance the atmosphere
Transparent UI that lets you see the beautiful background scenes
Genre-aware recommendations based on your music preferences
Automatic fallback systems for reliable performance

Technology Stack

Frontend: React.js with custom hooks and functional components
Voice Recognition: Web Speech API (built into modern browsers)
Music Services:

Spotify Web API & SDK for authenticated users
YouTube Data API v3 as fallback


Styling: Pure CSS with inline styles for simplicity
State Management: React hooks (useState, useEffect, useCallback)

Setup Instructions
Prerequisites

Node.js (v14 or newer)
npm or yarn
Spotify Developer account (optional but recommended)
Google Developer account with YouTube Data API v3 access (optional)

Installation

Clone the repository
bashgit clone https://github.com/yourusername/mood-music-app.git
cd mood-music-app

Install dependencies
bashnpm install

Create a .env file in the root directory with your API keys
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id
REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key

Start the development server
bashnpm start

Open http://localhost:3000 in your browser

API Keys Setup
Spotify API (Optional)

Go to Spotify Developer Dashboard
Create a new application
Set the redirect URI to http://localhost:3000/callback
Copy your Client ID and Client Secret to the .env file

YouTube API (Optional)

Go to Google Cloud Console
Create a new project
Enable the YouTube Data API v3
Create an API Key and copy it to the .env file

Note: The app uses fallback systems and will work even without API keys, though with limited functionality.
Usage

Click "Start Conversation" to begin
Speak naturally about how you're feeling
The AI will analyze your mood through the conversation
When ready, click "End Conversation"
The app will recommend songs based on your mood
The background and ambient music will change to match your emotional state
Play the recommended songs directly in the app

Customization

Toggle ambient background music with the dedicated button
Switch between AI modes (Enhanced/Basic)
Connect to Spotify for personalized recommendations
Use YouTube Music as a fallback option

Troubleshooting

Microphone access issues: Ensure your browser has permission to use your microphone
API errors: The app includes fallback systems if API keys are missing or invalid
Music playback issues: Try switching between Spotify and YouTube Music using the toggle
Speech recognition problems: Try using Chrome or Edge for best compatibility

