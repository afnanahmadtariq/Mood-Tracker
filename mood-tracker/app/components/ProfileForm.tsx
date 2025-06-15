'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfileForm() {
  const { user, updateProfile, logout, error } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    profilePicture: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        profilePicture: user.profilePicture || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setSuccessMessage('')
    
    const success = await updateProfile(formData)
    if (success) {
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
    
    setIsSubmitting(false)
  }

  if (!user) return null

  return (
    <div className="w-full h-full p-2 sm:p-4 lg:p-6">
      {/* Responsive Grid Layout */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-full max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
          
          {/* Left Column - Profile Info (Mobile: Full width, Desktop: 4 columns) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 flex flex-col justify-between">
            
            {/* Profile Header */}
            <div className="text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start space-y-2 sm:space-y-3 lg:space-y-4">
                {user.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl object-cover border-2 lg:border-3 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 lg:border-3 border-white shadow-lg">
                    <span className="text-white text-sm sm:text-lg lg:text-xl font-bold">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-800">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Section */}
            <div className="flex-1 space-y-3 lg:space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-1 sm:gap-2 p-2 sm:p-3 bg-white/80 rounded-lg lg:rounded-xl border border-blue-200">
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-blue-600">👤</div>
                  <div className="text-xs text-gray-600">Status</div>
                  <div className="text-xs font-semibold text-gray-800">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-green-600">📊</div>
                  <div className="text-xs text-gray-600">Type</div>
                  <div className="text-xs font-semibold text-gray-800">Free</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-purple-600">🔒</div>
                  <div className="text-xs text-gray-600">Privacy</div>
                  <div className="text-xs font-semibold text-gray-800">Secure</div>
                </div>
              </div>

              {/* Account Security - Hidden on mobile to save space */}
              <div className="hidden sm:block bg-white/80 rounded-lg lg:rounded-xl p-2 sm:p-3 lg:p-4 border border-blue-200">
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-2 lg:mb-3 flex items-center">
                  <span className="mr-2">🔒</span>
                  Account Security
                </h3>
                <div className="space-y-1 lg:space-y-2">
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Password</span>
                    <span className="text-green-600 font-semibold">🔐 Secure</span>
                  </div>
                  <div className="flex items-center justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Email</span>
                    <span className="text-blue-600 font-semibold">📧 Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full px-3 sm:px-4 py-2 lg:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 text-xs sm:text-sm font-semibold"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>

          {/* Right Column - Profile Settings Form (Mobile: Full width, Desktop: 8 columns) */}
          <div className="lg:col-span-8 p-3 sm:p-4 lg:p-6 overflow-y-auto flex flex-col h-full">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg lg:rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-sm sm:text-base lg:text-lg">⚙️</span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Profile Settings</h2>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage your personal information</p>
              </div>
            </div>
            
            {error && (
              <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2 animate-slide-in text-xs sm:text-sm">
                <span className="text-red-500">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2 animate-bounce-gentle text-xs sm:text-sm">
                <span className="text-green-500">✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 flex-1 flex flex-col">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
                    placeholder="First name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
                />
              </div>

              {/* Profile Picture */}
              <div className="flex-1">
                <label htmlFor="profilePicture" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 lg:mb-2">
                  Profile Picture URL
                </label>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    id="profilePicture"
                    name="profilePicture"
                    value={formData.profilePicture}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  {formData.profilePicture && (
                    <div className="flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                      src={formData.profilePicture}
                      alt="Profile preview"
                      width={32}
                      height={32}
                      className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Use a square image for best results
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-3 lg:pt-4 mt-auto">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs sm:text-sm ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Profile...
                    </span>
                  ) : (
                    '💾 Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
