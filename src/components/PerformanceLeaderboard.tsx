'use client'

import { useGameStore } from '@/store/gameStore'
import { computePerformanceScore } from '@/store/gameStore'

export function PerformanceLeaderboard() {
  const { getPerformanceLeaderboard, teamA, teamB } = useGameStore()
  
  const leaderboard = getPerformanceLeaderboard()
  const topPlayer = leaderboard[0]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Leaderboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Player of the Game candidates
        </p>
      </div>

      {/* PoG Highlight */}
      {topPlayer && (
        <div className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {topPlayer.player.photo_url ? (
                <img 
                  src={topPlayer.player.photo_url} 
                  alt={topPlayer.player.name}
                  className="w-16 h-16 object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-yellow-600">
                  {topPlayer.player.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Player of the Game</p>
              <p className="text-xl font-bold text-yellow-900">
                {topPlayer.player.name}
              </p>
              <p className="text-sm text-yellow-800">
                {topPlayer.team.name} • #{topPlayer.player.jersey_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-yellow-900">
                {topPlayer.score.toFixed(1)}
              </p>
              <p className="text-xs text-yellow-800">pts</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard entries */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {leaderboard.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No statistics recorded yet
          </div>
        ) : (
          leaderboard.slice(0, 10).map((entry, index) => (
            <LeaderboardEntry 
              key={entry.player.id}
              entry={entry}
              rank={index + 1}
              isPoG={index === 0}
            />
          ))
        )}
      </div>

      {/* Formula explanation */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
          Scoring Formula:
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Kills × 1.0</p>
          <p>• Blocks × 1.5</p>
          <p>• Aces × 1.2</p>
          <p>• Assists × 0.5</p>
          <p>• Excellent Digs × 1.0</p>
          <p>• Errors × -1.0</p>
        </div>
      </div>
    </div>
  )
}

interface LeaderboardEntryProps {
  entry: {
    player: {
      id: string
      name: string
      jersey_number: number
      position: string
      photo_url: string | null
    }
    score: number
    team: {
      name: string
      color: string
    }
  }
  rank: number
  isPoG: boolean
}

function LeaderboardEntry({ entry, rank, isPoG }: LeaderboardEntryProps) {
  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400 text-yellow-900'
      case 2:
        return 'bg-gray-300 text-gray-700'
      case 3:
        return 'bg-amber-600 text-amber-100'
      default:
        return 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
    }
  }

  return (
    <div className={`p-3 flex items-center gap-3 ${isPoG ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}>
      {/* Rank */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(rank)}`}>
        {rank}
      </div>

      {/* Player avatar */}
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
        {entry.player.photo_url ? (
          <img 
            src={entry.player.photo_url} 
            alt={entry.player.name}
            className="w-10 h-10 object-cover"
          />
        ) : (
          <span className="font-bold text-gray-600 dark:text-gray-300">
            {entry.player.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {entry.player.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          #{entry.player.jersey_number} • {entry.player.position} • {entry.team.name}
        </p>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className="font-bold text-gray-900 dark:text-white">
          {entry.score.toFixed(1)}
        </p>
      </div>
    </div>
  )
}

export default PerformanceLeaderboard
