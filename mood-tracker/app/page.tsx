'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from './context/AuthContext'
import { useIsClient } from './hooks/useIsClient'
import { isRecentDate, isSameDay } from './lib/dateUtils'
import AuthWrapper from './components/AuthWrapper'
import Header from './components/Header'
import MoodForm from './components/MoodForm'
import ProfileForm from './components/ProfileForm'
import ClientDate from './components/ClientDate'
import NoSSR from './components/NoSSR'
import Analytics from './analytics/page'

interface MoodEntry {
  _id: string
  mood: string
  note?: string
  date: string
}

// Component that uses useSearchParams and needs Suspense
function SearchParamsHandler({ 
  setActiveTab 
}: { 
  setActiveTab: (tab: 'mood' | 'profile' | 'analytics') => void 
}) {
  const searchParams = useSearchParams()

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['mood', 'profile', 'analytics'].includes(tab)) {
      setActiveTab(tab as 'mood' | 'profile' | 'analytics')
    }
  }, [searchParams, setActiveTab])

  return null // This component only handles side effects
}

function HomeContent() {
  const { user, loading } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [moodLoading, setMoodLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'mood' | 'profile' | 'analytics'>('mood')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const isClient = useIsClient()

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
  // Function to delete a mood entry
  const deleteMood = async (moodId: string) => {
    if (deleteConfirm !== moodId) {
      setDeleteConfirm(moodId)
      return
    }

    try {
      const response = await fetch(`/api/mood?id=${moodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete mood entry')
      }

      // Refresh the moods list after successful deletion
      refreshMoods()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting mood:', error)
      setDeleteConfirm(null)
      // You could add a toast notification here in the future
    }
  }

  // Helper function to get most common mood
  const getMostCommonMood = () => {
    if (moods.length === 0) return 'None yet'
    
    const moodCounts: { [key: string]: number } = {}
    moods.forEach(mood => {
      const moodName = mood.mood.split(' ').pop() || mood.mood
      moodCounts[moodName] = (moodCounts[moodName] || 0) + 1
    })
    
    const mostCommon = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )
    
    return mostCommon[0]
  }  // Helper function to get consecutive days streak
  const getConsecutiveDays = () => {
    if (moods.length === 0 || !isClient) return 0
    
    let streak = 0
    const today = new Date()
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    for (let i = 0; i < 30; i++) {
      const dayMoods = moods.filter(mood => {
        return isSameDay(mood.date, currentDate)
      })
      
      if (dayMoods.length > 0) {
        streak++
      } else {
        break
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }// Show loading screen
  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
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
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler setActiveTab={setActiveTab} />
      </Suspense>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} /><main className="flex-1 overflow-hidden">        {activeTab === 'mood' ? (
          <div className="w-full py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8 h-full overflow-y-auto">
            {/* Desktop Layout: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-5 gap-8">              {/* Mood Form Section - Left Side (Increased width) */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
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
              </div>              {/* Mood Journey Section - Right Side (Decreased width) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-h-[70vh] flex flex-col hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-green-600 text-xl">📈</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">Your Mood Journey</h2>
                        <p className="text-gray-600 text-sm">Track your emotional patterns over time</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {moods.length > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Total entries</p>
                          <p className="text-xl font-bold text-blue-600">{moods.length}</p>
                        </div>
                      )}
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        View Analytics
                      </button>
                    </div>
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
                        {moods.slice(0, 8).map((moodEntry, index) => (
                          <div 
                            key={moodEntry._id}
                            data-testid={`mood-entry-${moodEntry._id}`}
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
                              </div>                              <div className="flex items-start space-x-2">
                                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                                  <div className="font-medium">
                                    <ClientDate 
                                      date={moodEntry.date} 
                                      format="date"
                                      options={{
                                        month: 'short',
                                        day: 'numeric'
                                      }}
                                      fallback="Loading..."
                                    />
                                  </div>
                                  <div>
                                    <ClientDate 
                                      date={moodEntry.date} 
                                      format="time"
                                      options={{
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }}
                                      fallback="--:--"
                                    />
                                  </div>                                </div>
                                <button
                                  onClick={() => deleteMood(moodEntry._id)}
                                  data-testid={`delete-mood-${moodEntry._id}`}
                                  className={`p-1 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                                    deleteConfirm === moodEntry._id 
                                      ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                  }`}
                                  title={deleteConfirm === moodEntry._id ? "Click again to confirm deletion" : "Delete mood entry"}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                {deleteConfirm === moodEntry._id && (
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                                    title="Cancel deletion"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {moods.length > 8 && (
                          <div className="text-center pt-4">
                            <button
                              onClick={() => setActiveTab('analytics')}
                              className="inline-flex items-center px-4 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            >
                              View all {moods.length} entries and analytics
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        )}
                        
                        {/* Mood Journey Insights */}
                        {moods.length >= 3 && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                              <span className="mr-2">📈</span>
                              Your Journey Insights
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium text-gray-700">Most recent:</span>
                                  <p className="text-gray-600">{moods[0]?.mood}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">This week:</span>
                                  <p className="text-gray-600">{moods.filter(mood => 
                                    isRecentDate(mood.date, 7)
                                  ).length} entries</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium text-gray-700">Most common:</span>
                                  <p className="text-gray-600">{getMostCommonMood()}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Streak:</span>
                                  <p className="text-gray-600">{getConsecutiveDays()} days</p>
                                </div>
                              </div>
                            </div>
                            {moods.length >= 5 && (
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <button
                                  onClick={() => setActiveTab('analytics')}
                                  className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                                >
                                  View detailed analytics and trends →
                                </button>
                              </div>
                            )}
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
              </div>              {/* Mood Journey Section */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 max-h-[60vh] flex flex-col">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-lg sm:text-xl">📈</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Your Mood Journey</h2>
                      <p className="text-gray-600 text-sm hidden sm:block">Track your emotional patterns over time</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {moods.length > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">{moods.length}</p>
                      </div>
                    )}
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Analytics
                    </button>
                  </div>
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
                    <div className="space-y-3">                      {moods.slice(0, 6).map((moodEntry, index) => (
                        <div 
                          key={moodEntry._id}
                          data-testid={`mood-entry-mobile-${moodEntry._id}`}
                          className="card-hover border border-gray-200 rounded-xl p-3 sm:p-4 bg-gradient-to-r from-white to-gray-50 animate-slide-in"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        ><div className="flex justify-between items-start">
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
                            </div>                            <div className="flex items-start space-x-1 sm:space-x-2">
                              <div className="text-right text-xs text-gray-400 flex-shrink-0">
                                <div className="font-medium">
                                  <ClientDate 
                                    date={moodEntry.date} 
                                    format="date"
                                    options={{
                                      month: 'short',
                                      day: 'numeric'
                                    }}
                                    fallback="Loading..."
                                  />
                                </div>
                                <div>
                                  <ClientDate 
                                    date={moodEntry.date} 
                                    format="time"
                                    options={{
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    }}
                                    fallback="--:--"
                                  />
                                </div>
                              </div>                              <button
                                onClick={() => deleteMood(moodEntry._id)}
                                data-testid={`delete-mood-mobile-${moodEntry._id}`}
                                className={`p-1 rounded-lg transition-colors duration-200 flex-shrink-0 ${
                                  deleteConfirm === moodEntry._id 
                                    ? 'text-red-600 bg-red-100 hover:bg-red-200' 
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                                title={deleteConfirm === moodEntry._id ? "Click again to confirm deletion" : "Delete mood entry"}
                              >
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {deleteConfirm === moodEntry._id && (
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
                                  title="Cancel deletion"
                                >
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {moods.length > 6 && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => setActiveTab('analytics')}
                            className="inline-flex items-center px-4 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          >
                            View all {moods.length} entries
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                      
                      {/* Journey Insights */}
                      {moods.length >= 3 && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="mr-2">📈</span>
                            Your Journey Insights
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-700">Most recent:</span>
                                <p className="text-gray-600">{moods[0]?.mood}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">This week:</span>
                                <p className="text-gray-600">{moods.filter(mood => 
                                  new Date(mood.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ).length} entries</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-gray-700">Most common:</span>
                                <p className="text-gray-600">{getMostCommonMood()}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Streak:</span>
                                <p className="text-gray-600">{getConsecutiveDays()} days</p>
                              </div>
                            </div>
                          </div>
                          {moods.length >= 5 && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <button
                                onClick={() => setActiveTab('analytics')}
                                className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                              >
                                View detailed analytics and trends →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>) : activeTab === 'analytics' ? (
          <Analytics />
        ) : (
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

// Main component with Suspense boundary for useSearchParams
export default function Home() {
  return (
    <NoSSR fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-700">Loading your mood tracker</p>
            <p className="text-gray-500">Just a moment<span className="loading-dots"></span></p>
          </div>
        </div>
      </div>
    }>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-700">Loading your mood tracker</p>
              <p className="text-gray-500">Just a moment<span className="loading-dots"></span></p>
            </div>
          </div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </NoSSR>
  )
}
