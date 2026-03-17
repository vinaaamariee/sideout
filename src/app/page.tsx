'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'

export default function WelcomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          SideOut
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <div className="mb-6">
            <span className="inline-block p-4 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Welcome to SideOut
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Real-time volleyball scoring, analytics, and match reporting system
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Option 1: Official */}
          <button
            onClick={() => router.push('/auth/login')}
            className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Officiating Official
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Sign up or log in to create matches, track statistics, and generate reports
              </p>
              <div className="mt-4 text-blue-500 font-medium group-hover:text-blue-600 flex items-center">
                Get Started
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Option 2: Spectator */}
          <button
            onClick={() => router.push('/live')}
            className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                Live Score Viewer
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                View live scores, player statistics, and match updates in real-time
              </p>
              <div className="mt-4 text-green-500 font-medium group-hover:text-green-600 flex items-center">
                Watch Live
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full">
          {[
            { icon: '⚡', text: 'Real-time Scoring' },
            { icon: '📊', text: 'Live Analytics' },
            { icon: '📱', text: 'Mobile Ready' },
            { icon: '📄', text: 'PDF Reports' },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{feature.text}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2024 SideOut Volleyball Analytics. All rights reserved.
      </footer>
    </div>
  )
}
