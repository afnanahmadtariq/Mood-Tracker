'use client'

import { useState } from 'react'

interface MoodFormProps {
  onMoodSaved?: () => void
}

const moodOptions = [
  { value: 'Amazing', emoji: '🤩', color: 'bg-green-500', desc: 'Absolutely wonderful!' },
  { value: 'Happy', emoji: '😊', color: 'bg-green-400', desc: 'Feeling great!' },
  { value: 'Good', emoji: '🙂', color: 'bg-blue-400', desc: 'Pretty good day' },
  { value: 'Okay', emoji: '😐', color: 'bg-gray-400', desc: 'Just okay' },
  { value: 'Sad', emoji: '😢', color: 'bg-blue-600', desc: 'Feeling down' },
  { value: 'Angry', emoji: '😠', color: 'bg-red-500', desc: 'Frustrated or mad' },
  { value: 'Anxious', emoji: '😰', color: 'bg-yellow-500', desc: 'Worried or nervous' },
  { value: 'Tired', emoji: '😴', color: 'bg-purple-400', desc: 'Exhausted' },
]

export default function MoodForm({ onMoodSaved }: MoodFormProps) {
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, note }),
      })
      
      if (response.ok) {
        setMood('')
        setNote('')
        setSuccess(true)
        onMoodSaved?.()
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save mood')
      }
    } catch (error) {
      console.error('Error saving mood:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMoodOption = moodOptions.find(option => option.value === mood)
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 animate-slide-in">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm sm:text-base">{error}</span>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center space-x-2 animate-bounce-gentle">
          <span className="text-green-500">✅</span>
          <span className="text-sm sm:text-base">Mood saved successfully! 🎉</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            How are you feeling today?
          </label>
          
          {/* Mood Selection Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`mood-option p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  mood === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-30 selected'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2">{option.emoji}</div>
                  <div className="font-medium text-gray-800 text-xs sm:text-sm">{option.value}</div>
                  <div className="text-xs text-gray-500 mt-1 hidden sm:block lg:hidden xl:block">{option.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Selected mood indicator */}
          {selectedMoodOption && (
            <div className="flex items-center justify-center p-2 sm:p-3 bg-blue-50 rounded-lg animate-fade-in">
              <span className="text-xl sm:text-2xl mr-2">{selectedMoodOption.emoji}</span>
              <span className="text-blue-800 font-medium text-sm sm:text-base">
                You&apos;re feeling {selectedMoodOption.value.toLowerCase()}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Tell us more about it <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="note"
            placeholder="What's on your mind? Share your thoughts, what happened today, or how you're feeling..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 placeholder-gray-400 text-sm sm:text-base"
          />
          <div className="text-xs text-gray-500 mt-1">
            {note.length}/500 characters
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting || !mood}
          className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 transform text-sm sm:text-base ${
            isSubmitting || !mood
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 hover:transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Saving your mood...</span>
              <span className="sm:hidden">Saving...</span>
            </span>
          ) : (
            <>
              <span className="hidden sm:inline">💾 Save {mood ? `"${mood}"` : 'Mood'} Entry</span>
              <span className="sm:hidden">💾 Save {mood ? mood : 'Mood'}</span>
            </>
          )}
        </button>

        {!mood && (
          <p className="text-center text-xs sm:text-sm text-gray-500 animate-fade-in">
            👆 Please select how you&apos;re feeling to continue
          </p>
        )}
      </form>
    </div>
  )
}
