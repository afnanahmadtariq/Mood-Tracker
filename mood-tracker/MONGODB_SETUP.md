# MongoDB Setup Guide

The Mood Tracker app requires MongoDB to persist data. Here are your options:

## Option 1: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account
3. Create a new cluster (free tier is available)
4. Create a database user with read/write permissions
5. Get your connection string from the "Connect" button
6. Update your `.env.local` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mood-tracker?retryWrites=true&w=majority
   ```

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install MongoDB with default settings
3. MongoDB should start automatically as a Windows service
4. Your connection string will be: `mongodb://localhost:27017/mood-tracker`

### Using Docker (Alternative):
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Testing the Connection

1. Update your `.env.local` file with the correct MongoDB URI
2. Restart your Next.js development server:
   ```bash
   npm run dev
   ```
3. The yellow warning message should disappear when MongoDB is connected
4. Try adding a mood entry - it should save and appear in the recent moods section

## Troubleshooting

- **Connection Refused Error**: MongoDB service is not running
- **Authentication Failed**: Check username/password in connection string
- **Network Error**: Check firewall settings or Atlas IP whitelist

## Without MongoDB

The app will still work without MongoDB - you can add moods and see them in the interface, but they won't persist between sessions. This is useful for testing the UI.
