import { useState } from 'react'

interface MoodFormProps {
  onMoodSaved?: () => void
}

export default function MoodForm({ onMoodSaved }: MoodFormProps) {
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, note }),
      })
      
      if (response.ok) {
        setMood('')
        setNote('')
        onMoodSaved?.()
      }
    } catch (error) {
      console.error('Error saving mood:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
          How are you feeling?
        </label>
        <select 
          id="mood"
          value={mood} 
          onChange={(e) => setMood(e.target.value)} 
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your mood</option>
          <option value="😊 Happy">😊 Happy</option>
          <option value="😢 Sad">😢 Sad</option>
          <option value="😠 Angry">😠 Angry</option>
          <option value="😄 Excited">😄 Excited</option>
          <option value="😰 Anxious">😰 Anxious</option>
          <option value="😴 Tired">😴 Tired</option>
          <option value="😌 Calm">😌 Calm</option>
          <option value="🤔 Thoughtful">🤔 Thoughtful</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
          Additional notes (optional)
        </label>
        <textarea
          id="note"
          placeholder="What's on your mind?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isSubmitting ? 'Saving...' : 'Save Mood'}
      </button>
    </form>
  )
}
