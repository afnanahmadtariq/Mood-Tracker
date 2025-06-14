'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
          <div className="flex items-center space-x-4">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-4 border-gray-200">
                <span className="text-white text-2xl font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">👤</div>
            <div className="text-sm text-gray-600 mt-1">Profile Status</div>
            <div className="font-semibold text-gray-800">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">📊</div>
            <div className="text-sm text-gray-600 mt-1">Account Type</div>
            <div className="font-semibold text-gray-800">Free</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">🎯</div>
            <div className="text-sm text-gray-600 mt-1">Privacy</div>
            <div className="font-semibold text-gray-800">Secure</div>
          </div>
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-blue-600 text-xl">⚙️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2 animate-slide-in">
            <span className="text-red-500">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center space-x-2 animate-bounce-gentle">
            <span className="text-green-500">✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-3">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="profilePicture" className="block text-sm font-semibold text-gray-700 mb-3">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
              placeholder="https://example.com/your-photo.jpg"
            />          
            {formData.profilePicture && (
              <div className="mt-4 flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Image
                  src={formData.profilePicture}
                  alt="Profile preview"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Profile Picture Preview</p>
                  <p className="text-xs text-gray-500">This is how your profile picture will appear</p>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Use a high-quality square image for the best results. Supported formats: JPG, PNG, WebP
            </p>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating your profile...
                </span>
              ) : (
                '💾 Update Profile'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Additional Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <span className="text-gray-600 text-xl">🔒</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Account Security</h3>
            <p className="text-gray-600">Your account information is secure and encrypted</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">🔐</span>
              <span className="text-sm font-medium text-green-800">Secure Password</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Your password is encrypted and secure</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📧</span>
              <span className="text-sm font-medium text-blue-800">Email Verified</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Your email address is confirmed</p>
          </div>
        </div>
      </div>
    </div>
  )
}
