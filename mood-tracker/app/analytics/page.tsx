'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface MoodEntry {
  _id: string
  mood: string
  note?: string
  date: string
}

export default function Analytics() {
  const { user, loading } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [moodLoading, setMoodLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMoods()
    }
  }, [user])

  const fetchMoods = async () => {
    try {
      const response = await fetch('/api/mood')
      if (response.ok) {
        const data = await response.json()
        setMoods(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching moods:', error)
      setMoods([])
    } finally {
      setMoodLoading(false)
    }
  }

  // Helper function to get mood score for calculations
  const getMoodScore = (mood: string): number => {
    const moodScores: { [key: string]: number } = {
      'Amazing': 5,
      'Happy': 4,
      'Good': 3,
      'Okay': 2,
      'Sad': 1,
      'Angry': 1,
      'Anxious': 1,
      'Tired': 2,
    }
    const moodName = mood.split(' ').pop() || mood
    return moodScores[moodName] || 2
  }

  // Prepare data for mood trend line chart
  const prepareTrendData = () => {
    const last30Days = moods
      .filter(mood => new Date(mood.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      labels: last30Days.map(mood => 
        new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Mood Score',
          data: last30Days.map(mood => getMoodScore(mood.mood)),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    }
  }

  // Prepare data for mood frequency bar chart
  const prepareFrequencyData = () => {
    const moodCounts: { [key: string]: number } = {}
    moods.forEach(mood => {
      const moodName = mood.mood.split(' ').pop() || mood.mood
      moodCounts[moodName] = (moodCounts[moodName] || 0) + 1
    })

    const sortedMoods = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)

    return {
      labels: sortedMoods.map(([mood]) => mood),
      datasets: [
        {
          label: 'Frequency',
          data: sortedMoods.map(([,count]) => count),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(99, 102, 241, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(156, 163, 175, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(99, 102, 241, 1)',
          ],
          borderWidth: 2,
        },
      ],
    }
  }

  // Prepare data for mood distribution pie chart
  const prepareDistributionData = () => {
    const moodCounts: { [key: string]: number } = {}
    moods.forEach(mood => {
      const moodName = mood.mood.split(' ').pop() || mood.mood
      moodCounts[moodName] = (moodCounts[moodName] || 0) + 1
    })

    return {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: [
            '#22c55e',
            '#3b82f6',
            '#a855f7',
            '#f59e0b',
            '#ef4444',
            '#9ca3af',
            '#0ea5e9',
            '#6366f1',
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
        },
      ],
    }
  }

  // Calculate statistics
  const getStatistics = () => {
    if (moods.length === 0) return null

    const scores = moods.map(mood => getMoodScore(mood.mood))
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length

    const thisWeekMoods = moods.filter(mood => 
      new Date(mood.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    )

    const lastWeekMoods = moods.filter(mood => {
      const date = new Date(mood.date)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      return date > twoWeeksAgo && date <= oneWeekAgo
    })

    const thisWeekAvg = thisWeekMoods.length > 0 
      ? thisWeekMoods.map(m => getMoodScore(m.mood)).reduce((a, b) => a + b, 0) / thisWeekMoods.length 
      : 0

    const lastWeekAvg = lastWeekMoods.length > 0 
      ? lastWeekMoods.map(m => getMoodScore(m.mood)).reduce((a, b) => a + b, 0) / lastWeekMoods.length 
      : 0

    return {
      totalEntries: moods.length,
      averageScore: averageScore.toFixed(1),
      thisWeekEntries: thisWeekMoods.length,
      weeklyTrend: thisWeekAvg > lastWeekAvg ? 'up' : thisWeekAvg < lastWeekAvg ? 'down' : 'stable',
      streakDays: calculateStreak(),
    }
  }
  const calculateStreak = () => {
    if (moods.length === 0) return 0
    
    let streak = 0
    const today = new Date()
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    for (let i = 0; i < 30; i++) {
      const dayMoods = moods.filter(mood => {
        const moodDate = new Date(mood.date)
        return moodDate.toDateString() === currentDate.toDateString()
      })
      
      if (dayMoods.length > 0) {
        streak++
      } else {
        break
      }
      
      currentDate.setDate(currentDate.getDate() - 1)
    }
    
    return streak
  }
  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center overflow-y-auto">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-xl font-semibold text-gray-700">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center overflow-y-auto">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-gray-700">Please log in to view analytics</p>
        </div>
      </div>
    )
  }

  const statistics = getStatistics()
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your Mood Journey 
            <span className="text-blue-600 ml-2">📊</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover patterns in your emotional well-being through detailed analytics and insights.
          </p>
        </div>

        {moodLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your mood data...</p>
          </div>
        ) : moods.length === 0 ? (
          <div className="text-center py-16 space-y-6">
            <div className="text-6xl mb-4">📊</div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">No Data Yet</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Start tracking your moods to see beautiful analytics and insights about your emotional patterns.
              </p>              <Link
                href="/?tab=mood"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <span className="mr-2">📝</span>
                Start Tracking
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-2xl">📈</span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Entries</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.totalEntries}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-2xl">⭐</span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Average Score</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.averageScore}/5</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-purple-600 text-2xl">🔥</span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Current Streak</p>
                      <p className="text-2xl font-bold text-gray-900">{statistics.streakDays} days</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      statistics.weeklyTrend === 'up' ? 'bg-green-100' : 
                      statistics.weeklyTrend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-2xl ${
                        statistics.weeklyTrend === 'up' ? 'text-green-600' : 
                        statistics.weeklyTrend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {statistics.weeklyTrend === 'up' ? '📈' : statistics.weeklyTrend === 'down' ? '📉' : '➡️'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Weekly Trend</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{statistics.weeklyTrend}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mood Trend Line Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📈</span>
                  Mood Trend (Last 30 Days)
                </h3>
                <div className="h-80">
                  <Line
                    data={prepareTrendData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 5,
                          ticks: {
                            stepSize: 1,
                            callback: function(value) {
                              const labels = ['', 'Poor', 'Okay', 'Good', 'Great', 'Amazing']
                              return labels[value as number] || value
                            }
                          }
                        },
                        x: {
                          ticks: {
                            maxTicksLimit: 10,
                          }
                        }
                      },
                    }}
                  />
                </div>
              </div>

              {/* Mood Distribution Pie Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🥧</span>
                  Mood Distribution
                </h3>
                <div className="h-80 flex items-center justify-center">
                  <Doughnut
                    data={prepareDistributionData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                          }
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Mood Frequency Bar Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Mood Frequency
                </h3>
                <div className="h-80">
                  <Bar
                    data={prepareFrequencyData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          }
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Mood History */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🕒</span>
                Recent Mood Entries
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {moods.slice(0, 10).map((moodEntry) => (
                  <div 
                    key={moodEntry._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getMoodEmoji(moodEntry.mood)}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{moodEntry.mood}</p>
                        {moodEntry.note && (
                          <p className="text-sm text-gray-600 italic">&ldquo;{moodEntry.note}&rdquo;</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{new Date(moodEntry.date).toLocaleDateString()}</div>
                      <div>{new Date(moodEntry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper function for mood emojis
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
  
  const moodName = mood.split(' ').pop() || mood
  return moodEmojiMap[moodName] || '🙂'
}
