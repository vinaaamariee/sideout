'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { motion } from 'framer-motion'
import { Play, Users, BarChart3, Trophy, Zap, Shield, Flame, ArrowRight, Radio } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const features = [
    {
      icon: <Radio className="w-6 h-6" />,
      title: "Live Broadcast Feel",
      description: "Animated scoreboard with real-time updates, glow effects, and ESPN-style interface"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Interactive Court",
      description: "Tap players, highlight servers, animate rotations - make it feel like a pro broadcast"
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: "Smart Stats",
      description: "Color-coded buttons with icons, haptic feedback, and floating +1 animations"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Real-Time Leaderboard",
      description: "Premium player cards with progress bars, rankings, and crown for MVP"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-900/20 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-xl font-black">S</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            SideOut
          </h1>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-gray-600 transition-all"
        >
          {theme === 'dark' ? (
            <Zap className="w-5 h-5 text-yellow-500" />
          ) : (
            <Shield className="w-5 h-5 text-gray-400" />
          )}
        </motion.button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-400">Live Volleyball Scoring</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent"
          >
            Score Like a
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Pro Announcer
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Transform your volleyball matches into exciting sports broadcasts. 
            Real-time stats, interactive court, and premium animations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/auth/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold text-lg flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Get Started
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/live')}
              className="px-8 py-4 bg-gray-800/50 border border-gray-700 rounded-xl font-bold text-lg flex items-center gap-2 hover:border-gray-500 transition-all"
            >
              <Radio className="w-5 h-5 text-red-400" />
              Watch Live
            </motion.button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8"
          >
            Premium Features
          </motion.h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.5 }}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Demo Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-4xl mx-auto mt-16 p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl"
        >
          <div className="bg-gray-900 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-red-500">LIVE</span>
                </div>
                <span className="text-gray-400 text-sm">SET 3 • 12-10</span>
              </div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-gray-900" />
                <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-gray-900" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-black mb-2">A</div>
                <div className="text-4xl font-black">12</div>
              </div>
              <div className="text-gray-500 text-2xl">:</div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl font-black mb-2">B</div>
                <div className="text-4xl font-black">10</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2024 SideOut. Premium Volleyball Scoring.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Built with passion
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
