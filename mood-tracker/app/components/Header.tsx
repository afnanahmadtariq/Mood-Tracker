'use client'

import { useState } from 'react'
import Image from 'next/image'
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
    <header className="shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">💭</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Mood Tracker
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Your emotional wellness companion</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-2">
            <button
              onClick={() => setActiveTab('mood')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeTab === 'mood'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📊</span>
                <span>My Moods</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>👤</span>
                <span>Profile</span>
              </span>
            </button>
          </nav>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-gray-50 transition-all duration-200"
            >              
            {user?.profilePicture ? (
                <Image
                  className="h-10 w-10 rounded-xl object-cover border-2 border-gray-200"
                  src={user.profilePicture}
                  alt="Profile"
                  width={40}
                  height={40}
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-white text-sm font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-gray-800 font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    {user?.profilePicture ? (
                      <Image
                        className="h-12 w-12 rounded-xl object-cover"
                        src={user.profilePicture}
                        alt="Profile"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile')
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center space-x-3"
                >
                  <span>⚙️</span>
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 flex items-center space-x-3"
                >
                  <span>🚪</span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => setActiveTab('mood')}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'mood'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>📊</span>
              <span>My Moods</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-base font-medium w-full text-left transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>👤</span>
              <span>Profile</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
