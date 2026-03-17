'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useGameStore } from '@/store/gameStore'
import { supabase } from '@/lib/supabase'
import type { Team, Match, Player } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { setMatch, resetMatch } = useGameStore()
  
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewMatch, setShowNewMatch] = useState(false)
  const [selectedTeamA, setSelectedTeamA] = useState('')
  const [selectedTeamB, setSelectedTeamB] = useState('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams()
      fetchMatches()
    }
  }, [isAuthenticated])

  const fetchTeams = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')
      
      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchMatches = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*)')
        .order('match_date', { ascending: false })
        .limit(10)
      
      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async () => {
    if (!selectedTeamA || !selectedTeamB || selectedTeamA === selectedTeamB) {
      alert('Please select two different teams')
      return
    }
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          team_a_id: selectedTeamA,
          team_b_id: selectedTeamB,
          match_date: new Date().toISOString(),
          status: 'in_progress',
        })
        .select('*, team_a(*), team_b(*)')
        .single()

      if (error) throw error

      // Set the match in the game store
      if (data) {
        setMatch(data.id, data.team_a, data.team_b)
        router.push(`/match/${data.id}`)
      }
    } catch (error) {
      console.error('Error creating match:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const handleContinueMatch = (match: Match) => {
    setMatch(match.id, match.team_a!, match.team_b!)
    router.push(`/match/${match.id}`)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                SideOut
              </Link>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Official Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome, {user?.fullName || 'Official'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New Match Card */}
            <button
              onClick={() => setShowNewMatch(true)}
              className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all text-white text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">New Match</h3>
                  <p className="text-blue-100 text-sm">Start a new match</p>
                </div>
              </div>
            </button>

            {/* Teams Card */}
            <Link
              href="/dashboard/teams"
              className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all text-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Manage Teams</h3>
                  <p className="text-purple-100 text-sm">Add or edit teams</p>
                </div>
              </div>
            </Link>

            {/* Analytics Card */}
            <Link
              href="/dashboard/analytics"
              className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all text-white"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Analytics</h3>
                  <p className="text-green-100 text-sm">View statistics</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* New Match Modal */}
        {showNewMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Create New Match
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team A
                  </label>
                  <select
                    value={selectedTeamA}
                    onChange={(e) => setSelectedTeamA(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">Select Team A</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team B
                  </label>
                  <select
                    value={selectedTeamB}
                    onChange={(e) => setSelectedTeamB(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="">Select Team B</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowNewMatch(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMatch}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Match
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Matches */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Matches
          </h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {match.team_a?.name || 'TBD'}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {match.team_a_score}
                      </p>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">vs</span>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {match.team_b?.name || 'TBD'}
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {match.team_b_score}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      match.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : match.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {match.status === 'in_progress' ? 'Live' : match.status}
                    </span>
                    
                    {match.status === 'in_progress' && (
                      <button
                        onClick={() => handleContinueMatch(match)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No matches yet. Create your first match!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
