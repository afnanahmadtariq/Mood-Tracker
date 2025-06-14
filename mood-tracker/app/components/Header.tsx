'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  activeTab: 'mood' | 'profile'
  setActiveTab: (tab: 'mood' | 'profile') => void
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  return (
    <header className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => setActiveTab('mood')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'mood'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Moods
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {user?.profilePicture ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user.profilePicture}
                  alt="Profile"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <span className="hidden md:block text-gray-700 font-medium">
                {user?.firstName} {user?.lastName}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile')
                    setShowDropdown(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => setActiveTab('mood')}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                activeTab === 'mood'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Moods
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
