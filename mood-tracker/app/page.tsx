'use client'

import { useState, useEffect } from 'react'
import MoodForm from './components/MoodForm'

interface MoodEntry {
  _id: string
  mood: string
  note?: string
  date: string
}

export default function Home() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMoods = async () => {
    try {
      const response = await fetch('/api/mood')
      
      if (!response.ok) {
        console.error('API responded with status:', response.status)
        setMoods([]) // Set empty array as fallback
        return
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setMoods(data)
      } else {
        console.error('API returned non-array data:', data)
        setMoods([])
      }
    } catch (error) {
      console.error('Error fetching moods:', error)
      setMoods([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMoods()
  }, [])

  const refreshMoods = () => {
    fetchMoods()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mood Tracker</h1>
          <p className="text-gray-600">Track your daily moods and emotions</p>
          
          {/* Database Connection Warning */}
          {!loading && moods.length === 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <p className="text-sm">
                <strong>Note:</strong> MongoDB is not connected. Your mood entries will not be saved permanently. 
                <br />
                To enable data persistence, please set up MongoDB and update your .env.local file.
              </p>
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mood Form Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">How are you feeling?</h2>
            <MoodForm onMoodSaved={refreshMoods} />
          </div>

          {/* Recent Moods Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Moods</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : moods.length === 0 ? (
              <p className="text-gray-500">No moods recorded yet. Start by adding your first mood!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {moods.slice(0, 10).map((mood) => (
                  <div key={mood._id} className="border-l-4 border-blue-400 pl-4 py-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-lg">{mood.mood}</span>
                        {mood.note && (
                          <p className="text-gray-600 text-sm mt-1">{mood.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(mood.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
