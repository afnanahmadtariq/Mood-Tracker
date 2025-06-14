'use client'

import { useState, useEffect, useCallback } from 'react'
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

  const fetchMoods = useCallback(async () => {
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
  }, [user])

  useEffect(() => {
    if (user) {
      fetchMoods()
    }
  }, [user, fetchMoods])

  const refreshMoods = () => {
    fetchMoods()
  }
  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-700">Loading your mood tracker</p>
            <p className="text-gray-500">Just a moment<span className="loading-dots"></span></p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'mood' ? (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                How are you feeling today? 
                <span className="text-blue-600 ml-2">💭</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Take a moment to check in with yourself. Your emotions matter and tracking them can help you understand patterns in your well-being.
              </p>
            </div>

            {/* Mood Form Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📝</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Record Your Mood</h2>
                  <p className="text-gray-600">Share how you&apos;re feeling right now</p>
                </div>
              </div>
              <MoodForm onMoodSaved={refreshMoods} />
            </div>

            {/* Mood History Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-xl">📊</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Your Mood Journey</h2>
                    <p className="text-gray-600">Track your emotional patterns over time</p>
                  </div>
                </div>
                {moods.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total entries</p>
                    <p className="text-2xl font-bold text-blue-600">{moods.length}</p>
                  </div>
                )}
              </div>
              
              {moodLoading ? (
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                  </div>
                  <p className="text-gray-600 text-lg">Loading your mood history<span className="loading-dots"></span></p>
                </div>
              ) : moods.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="text-6xl mb-4">🌱</div>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-gray-700">Your mood journey starts here!</p>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No moods recorded yet. Start by sharing how you&apos;re feeling above to begin tracking your emotional well-being.
                    </p>
                  </div>
                  <button
                    onClick={() => document.querySelector('select')?.focus()}
                    className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="mr-2">📝</span>
                    Record your first mood
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {moods.map((moodEntry, index) => (
                    <div 
                      key={moodEntry._id} 
                      className="card-hover border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 animate-slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-3xl">{getMoodEmoji(moodEntry.mood)}</div>
                            <div>
                              <p className="text-xl font-bold text-gray-800">{moodEntry.mood}</p>
                              <p className="text-sm text-gray-500">
                                {getTimeAgo(moodEntry.date)}
                              </p>
                            </div>
                          </div>
                          {moodEntry.note && (
                            <div className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-r-lg">
                              <p className="text-gray-700 italic">&ldquo;{moodEntry.note}&rdquo;</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-400 ml-6">
                          <div className="font-medium">
                            {new Date(moodEntry.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs">
                            {new Date(moodEntry.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Mood Summary Stats */}
                  {moods.length >= 3 && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="mr-2">📈</span>
                        Recent Mood Insights
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Most recent mood:</span> {moods[0]?.mood}
                        </div>
                        <div>
                          <span className="font-medium">Entries this week:</span> {moods.filter(mood => 
                            new Date(mood.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ).length}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ProfileForm />
          </div>
        )}
      </main>
    </div>
  )
}

// Helper functions
function getMoodEmoji(mood: string): string {
  const moodEmojiMap: { [key: string]: string } = {
    'Amazing': '🤩',
    'Happy': '😊',
    'Good': '🙂',
    'Okay': '😐',
    'Sad': '😢',
    'Angry': '😠',
    'Anxious': '😰',
    'Tired': '😴',
  }
  
  // Extract mood name from entries like "😊 Happy" or just "Happy"
  const moodName = mood.split(' ').pop() || mood
  return moodEmojiMap[moodName] || '🙂'
}

function getTimeAgo(date: string): string {
  const now = new Date()
  const moodDate = new Date(date)
  const diffInHours = Math.floor((now.getTime() - moodDate.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
}
