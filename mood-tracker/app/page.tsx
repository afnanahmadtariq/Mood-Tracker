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
  }  // Main authenticated app
  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'mood' ? (
          <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8 h-full overflow-y-auto">
            {/* Header Section */}
            <div className="text-center space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                How are you feeling today? 
                <span className="text-blue-600 ml-2">💭</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Take a moment to check in with yourself. Your emotions matter and tracking them can help you understand patterns in your well-being.
              </p>
            </div>

            {/* Desktop Layout: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-8 h-[calc(100vh-280px)]">
              {/* Mood Form Section - Left Side */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full overflow-y-auto hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-xl">📝</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Record Your Mood</h2>
                      <p className="text-gray-600 text-sm">Share how you&apos;re feeling right now</p>
                    </div>
                  </div>
                  <MoodForm onMoodSaved={refreshMoods} />
                </div>
              </div>

              {/* Mood History Section - Right Side */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-green-600 text-xl">📊</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Your Mood Journey</h2>
                        <p className="text-gray-600 text-sm">Track your emotional patterns over time</p>
                      </div>
                    </div>
                    {moods.length > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total entries</p>
                        <p className="text-xl font-bold text-blue-600">{moods.length}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {moodLoading ? (
                      <div className="text-center py-12">
                        <div className="relative inline-block">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                        </div>
                        <p className="text-gray-600 text-lg">Loading your mood history<span className="loading-dots"></span></p>
                      </div>
                    ) : moods.length === 0 ? (
                      <div className="text-center py-16 space-y-4">
                        <div className="text-5xl mb-4">🌱</div>
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-700">Your mood journey starts here!</p>
                          <p className="text-gray-500 max-w-md mx-auto text-sm">
                            No moods recorded yet. Start by sharing how you&apos;re feeling to begin tracking your emotional well-being.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {moods.map((moodEntry, index) => (
                          <div 
                            key={moodEntry._id} 
                            className="card-hover border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 animate-slide-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="text-2xl">{getMoodEmoji(moodEntry.mood)}</div>
                                  <div>
                                    <p className="text-lg font-bold text-gray-800">{moodEntry.mood}</p>
                                    <p className="text-xs text-gray-500">
                                      {getTimeAgo(moodEntry.date)}
                                    </p>
                                  </div>
                                </div>
                                {moodEntry.note && (
                                  <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded-r-lg">
                                    <p className="text-gray-700 italic text-sm">&ldquo;{moodEntry.note}&rdquo;</p>
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-xs text-gray-400 ml-4 flex-shrink-0">
                                <div className="font-medium">
                                  {new Date(moodEntry.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div>
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
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                              <span className="mr-2">📈</span>
                              Recent Insights
                            </h3>
                            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">Most recent:</span> {moods[0]?.mood}
                              </div>
                              <div>
                                <span className="font-medium">This week:</span> {moods.filter(mood => 
                                  new Date(mood.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ).length} entries
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout: Vertical Stack */}
            <div className="lg:hidden space-y-6">
              {/* Mood Form Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-lg sm:text-xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Record Your Mood</h2>
                    <p className="text-gray-600 text-sm">Share how you&apos;re feeling right now</p>
                  </div>
                </div>
                <MoodForm onMoodSaved={refreshMoods} />
              </div>

              {/* Mood History Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 max-h-[60vh] flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-lg sm:text-xl">📊</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Your Mood Journey</h2>
                      <p className="text-gray-600 text-sm hidden sm:block">Track your emotional patterns over time</p>
                    </div>
                  </div>
                  {moods.length > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg sm:text-xl font-bold text-blue-600">{moods.length}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {moodLoading ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="relative inline-block">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                      </div>
                      <p className="text-gray-600 text-sm sm:text-lg">Loading your mood history<span className="loading-dots"></span></p>
                    </div>
                  ) : moods.length === 0 ? (
                    <div className="text-center py-8 sm:py-16 space-y-4">
                      <div className="text-4xl sm:text-5xl mb-4">🌱</div>
                      <div className="space-y-2">
                        <p className="text-base sm:text-lg font-semibold text-gray-700">Your mood journey starts here!</p>
                        <p className="text-gray-500 max-w-md mx-auto text-sm">
                          No moods recorded yet. Start by sharing how you&apos;re feeling above to begin tracking your emotional well-being.
                        </p>
                      </div>
                      <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                      >
                        <span className="mr-2">📝</span>
                        Record your first mood
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moods.map((moodEntry, index) => (
                        <div 
                          key={moodEntry._id} 
                          className="card-hover border border-gray-200 rounded-xl p-3 sm:p-4 bg-gradient-to-r from-white to-gray-50 animate-slide-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                                <div className="text-xl sm:text-2xl">{getMoodEmoji(moodEntry.mood)}</div>
                                <div>
                                  <p className="text-sm sm:text-lg font-bold text-gray-800">{moodEntry.mood}</p>
                                  <p className="text-xs text-gray-500">
                                    {getTimeAgo(moodEntry.date)}
                                  </p>
                                </div>
                              </div>
                              {moodEntry.note && (
                                <div className="bg-blue-50 border-l-4 border-blue-200 p-2 sm:p-3 rounded-r-lg">
                                  <p className="text-gray-700 italic text-xs sm:text-sm">&ldquo;{moodEntry.note}&rdquo;</p>
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-gray-400 ml-3 sm:ml-4 flex-shrink-0">
                              <div className="font-medium">
                                {new Date(moodEntry.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              <div>
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
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                            <span className="mr-2">📈</span>
                            Recent Insights
                          </h3>
                          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Most recent:</span> {moods[0]?.mood}
                            </div>
                            <div>
                              <span className="font-medium">This week:</span> {moods.filter(mood => 
                                new Date(mood.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                              ).length} entries
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>        ) : (
          <div className="h-full">
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
