'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthWrapper() {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const { loading } = useAuth()

  const toggleForm = () => {
    setIsLoginMode(!isLoginMode)
  }
  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-4">
          <div className="text-6xl mb-4">💭</div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mood Tracker
            </h1>
            <p className="text-lg text-gray-600 max-w-sm mx-auto">
              Your personal companion for emotional wellness and mental health tracking
            </p>
          </div>
        </div>
        
        {isLoginMode ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} />
        )}
        
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🌟</span>
              <span>Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💙</span>
              <span>Caring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
