'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import AuthWrapper from './components/AuthWrapper'
import Header from './components/Header'
import MoodForm from './components/MoodForm'
import ProfileForm from './components/ProfileForm'

interface MoodEntry {
  _id: string
  mood: string
  note?: string
  date: string
}

export default function Home() {
  const { user, loading } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [moodLoading, setMoodLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'mood' | 'profile'>('mood')

  const fetchMoods = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/mood')
      
      if (!response.ok) {
        console.error('API responded with status:', response.status)
        setMoods([])
        return
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setMoods(data)
      } else {
        console.error('API returned non-array data:', data)
        setMoods([])
      }
    } catch (error) {
      console.error('Error fetching moods:', error)
      setMoods([])
    } finally {
      setMoodLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMoods()
    }
  }, [user])

  const refreshMoods = () => {
    fetchMoods()
  }

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show authentication if user is not logged in
  if (!user) {
    return <AuthWrapper />
  }

  // Main authenticated app
  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'mood' ? (
          <div className="space-y-6">
            {/* Mood Form Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Record Your Mood</h2>
              <MoodForm onMoodSaved={refreshMoods} />
            </div>

            {/* Mood History Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Mood History</h2>
              
              {moodLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading your moods...</p>
                </div>
              ) : moods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No moods recorded yet</p>
                  <p className="text-sm text-gray-400">Start by recording your first mood above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moods.map((moodEntry) => (
                    <div key={moodEntry._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-lg font-medium text-gray-800 mb-1">{moodEntry.mood}</p>
                          {moodEntry.note && (
                            <p className="text-gray-600 mb-2">{moodEntry.note}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 ml-4">
                          {new Date(moodEntry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ProfileForm />
        )}
      </main>
    </div>
  )
}
