# Mood Tracker

A simple and beautiful web application to track your daily moods and emotions.

## Features

- 🎭 Track different moods with emoji indicators
- 📝 Add optional notes to your mood entries
- 📊 View your recent mood history
- 🎨 Beautiful, responsive UI with Tailwind CSS
- 💾 Data persistence with MongoDB

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Navigate to the mood-tracker directory
3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up your environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update the `MONGODB_URI` with your MongoDB connection string

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Track Your Mood**: Select how you're feeling from the dropdown menu
2. **Add Notes** (Optional): Write about what's on your mind
3. **Save**: Click "Save Mood" to record your entry
4. **View History**: See your recent moods displayed on the right side

## Available Moods

- 😊 Happy
- 😢 Sad  
- 😠 Angry
- 😄 Excited
- 😰 Anxious
- 😴 Tired
- 😌 Calm
- 🤔 Thoughtful

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Development**: ESLint, TypeScript

## Project Structure

```
app/
├── api/mood/route.ts       # API endpoints for mood operations
├── components/MoodForm.tsx # Form component for adding moods
├── lib/mongodb.ts          # MongoDB connection utility
├── models/Mood.ts          # Mongoose model for mood data
├── globals.css             # Global styles
├── layout.tsx              # Root layout component
└── page.tsx                # Main page component
```

## API Endpoints

- `GET /api/mood` - Fetch all moods (sorted by date, newest first)
- `POST /api/mood` - Create a new mood entry

## Contributing

Feel free to submit issues and enhancement requests!
