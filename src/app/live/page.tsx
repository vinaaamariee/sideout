'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeStore } from '@/store/themeStore'
import { useGameStore } from '@/store/gameStore'
import { supabase } from '@/lib/supabase'
import type { Match, Team } from '@/types'

export default function LiveViewerPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useThemeStore()
  const { teamA, teamB, teamAScore, teamBScore, currentSet, servingTeam, teamAPositions, teamBPositions } = useGameStore()
  
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchLiveMatches()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('live-matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchLiveMatches()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchLiveMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, team_a:teams!matches_team_a_id_fkey(*), team_b:teams!matches_team_b_id_fkey(*)')
        .eq('status', 'in_progress')
        .order('match_date', { ascending: false })
      
      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId)
    const match = matches.find(m => m.id === matchId)
    if (match) {
      router.push(`/live/${matchId}`)
    }
  }

  if (!mounted) {
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
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mr-3">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                LIVE
              </span>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                SideOut Live
              </h1>
            </div>
            
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Available Live Matches
            </h2>
            <div className="space-y-4">
              {matches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => handleSelectMatch(match.id)}
                  className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all text-left border-2 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Team A */}
                      <div className="text-center">
                        {match.team_a?.logo_url && (
                          <img 
                            src={match.team_a.logo_url} 
                            alt={match.team_a.name}
                            className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                          />
                        )}
                        <p className="font-bold text-gray-900 dark:text-white">
                          {match.team_a?.name || 'TBD'}
                        </p>
                        <p className="text-3xl font-bold text-blue-600">
                          {match.team_a_score}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">SET {match.current_set}</p>
                        <p className="text-2xl font-bold text-gray-400">vs</p>
                      </div>

                      {/* Team B */}
                      <div className="text-center">
                        {match.team_b?.logo_url && (
                          <img 
                            src={match.team_b.logo_url} 
                            alt={match.team_b.name}
                            className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                          />
                        )}
                        <p className="font-bold text-gray-900 dark:text-white">
                          {match.team_b?.name || 'TBD'}
                        </p>
                        <p className="text-3xl font-bold text-red-600">
                          {match.team_b_score}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Live Matches
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no matches in progress right now. Check back later!
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
