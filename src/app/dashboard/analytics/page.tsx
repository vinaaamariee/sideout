'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { useGameStore } from '@/store/gameStore'
import { supabase } from '@/lib/supabase'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import type { Team, Match, Player, PlayerStats } from '@/types'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { teamAStats, teamBStats, teamA, teamB, matchLogs } = useGameStore()

  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchMatches()
    }
  }, [isAuthenticated])

  const fetchMatches = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false })
        .limit(20)
      
      if (error) throw error
      setMatches(data || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate team stats from current match
  const calculateTeamStats = (stats: Record<string, PlayerStats>) => {
    let totalKills = 0
    let totalErrors = 0
    let totalAttempts = 0
    let totalAces = 0
    let totalBlocks = 0
    let perfectReceptions = 0
    let goodReceptions = 0
    let receptionErrors = 0

    Object.values(stats).forEach(playerStats => {
      totalKills += playerStats.kills
      totalErrors += playerStats.errors
      totalAttempts += playerStats.attacks
      totalAces += playerStats.aces
      totalBlocks += playerStats.blocks
      perfectReceptions += playerStats.perfect_receptions
      goodReceptions += playerStats.good_receptions
      receptionErrors += playerStats.reception_errors
    })

    const hittingPct = totalAttempts > 0 ? ((totalKills - totalErrors) / totalAttempts) * 100 : 0
    const totalReceptions = perfectReceptions + goodReceptions + receptionErrors
    const receptionEff = totalReceptions > 0 ? (((perfectReceptions + goodReceptions) - receptionErrors) / totalReceptions) * 100 : 0

    return {
      totalKills,
      totalErrors,
      totalAttempts,
      totalAces,
      totalBlocks,
      hittingPct: hittingPct.toFixed(2),
      receptionEff: receptionEff.toFixed(2),
    }
  }

  const teamAStatsCalc = calculateTeamStats(teamAStats)
  const teamBStatsCalc = calculateTeamStats(teamBStats)

  // Bar chart data - Points comparison
  const pointsData = {
    labels: ['Kills', 'Aces', 'Blocks', 'Errors'],
    datasets: [
      {
        label: teamA?.name || 'Team A',
        data: [teamAStatsCalc.totalKills, teamAStatsCalc.totalAces, teamAStatsCalc.totalBlocks, teamAStatsCalc.totalErrors],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: teamB?.name || 'Team B',
        data: [teamBStatsCalc.totalKills, teamBStatsCalc.totalAces, teamBStatsCalc.totalBlocks, teamBStatsCalc.totalErrors],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  }

  // Pie chart data - Attack distribution
  const attackDistribution = {
    labels: ['Kills', 'Errors', 'Attempts'],
    datasets: [
      {
        data: [
          teamAStatsCalc.totalKills + teamBStatsCalc.totalKills,
          teamAStatsCalc.totalErrors + teamBStatsCalc.totalErrors,
          (teamAStatsCalc.totalAttempts + teamBStatsCalc.totalAttempts) - (teamAStatsCalc.totalKills + teamBStatsCalc.totalKills + teamAStatsCalc.totalErrors + teamBStatsCalc.totalErrors)
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
  }

  // Line chart data - Match log timeline
  const timelineData = {
    labels: matchLogs.slice(0, 20).map((_, i) => `Action ${i + 1}`),
    datasets: [
      {
        label: 'Actions Over Time',
        data: matchLogs.slice(0, 20).map((_, i) => i + 1),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
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
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Analytics Dashboard
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Team A Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {teamA?.name || 'Team A'} Hitting %
            </h3>
            <p className="text-3xl font-bold text-blue-600">{teamAStatsCalc.hittingPct}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {teamA?.name || 'Team A'} Kills
            </h3>
            <p className="text-3xl font-bold text-blue-600">{teamAStatsCalc.totalKills}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {teamB?.name || 'Team B'} Hitting %
            </h3>
            <p className="text-3xl font-bold text-red-600">{teamBStatsCalc.hittingPct}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {teamB?.name || 'Team B'} Kills
            </h3>
            <p className="text-3xl font-bold text-red-600">{teamBStatsCalc.totalKills}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Points Comparison */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Points Comparison
            </h2>
            <div className="h-64">
              <Bar data={pointsData} options={chartOptions} />
            </div>
          </div>

          {/* Attack Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Attack Distribution
            </h2>
            <div className="h-64">
              <Pie data={attackDistribution} options={chartOptions} />
            </div>
          </div>

          {/* Match Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Match Actions Timeline
            </h2>
            <div className="h-64">
              <Line data={timelineData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Matches
          </h2>
          
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Teams</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Score</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 10).map(match => (
                    <tr key={match.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {new Date(match.match_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {match.team_a_score} - {match.team_b_score}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-gray-900 dark:text-white">
                        {match.team_a_score} : {match.team_b_score}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No matches played yet
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
