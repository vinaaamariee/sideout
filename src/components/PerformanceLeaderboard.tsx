'use client'

import { useGameStore } from '@/store/gameStore'
import { computePerformanceScore } from '@/store/gameStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Medal, Trophy, Star, TrendingUp, Award } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PerformanceLeaderboard() {
  const { getPerformanceLeaderboard, teamA, teamB } = useGameStore()
  
  const leaderboard = getPerformanceLeaderboard()
  const topPlayer = leaderboard[0]

  // Team colors
  const teamAColor = teamA?.color || '#3b82f6'
  const teamBColor = teamB?.color || '#ef4444'

  // Calculate max score for progress bar
  const maxScore = leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.score)) : 100

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard
            </h2>
            <p className="text-xs text-gray-400">
              Top performers
            </p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">PoG</span>
          </div>
        </div>
      </div>

      {/* PoG Highlight */}
      {topPlayer && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-transparent" />
          
          <div className="relative p-4">
            <div className="flex items-center gap-4">
              {/* Crown icon */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 z-10"
              >
                <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </motion.div>

              {/* Player avatar */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="relative mt-4"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 shadow-lg shadow-yellow-500/30">
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                    {topPlayer.player.photo_url ? (
                      <img 
                        src={topPlayer.player.photo_url} 
                        alt={topPlayer.player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-yellow-400">
                        {topPlayer.player.name.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Jersey number */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-800 border-2 border-yellow-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">#{topPlayer.player.jersey_number}</span>
                </div>
              </motion.div>

              {/* Player info */}
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-400 uppercase tracking-wider">Player of the Game</p>
                <motion.p 
                  className="text-2xl font-black text-white"
                  key={topPlayer.player.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {topPlayer.player.name}
                </motion.p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">
                    {topPlayer.team.name}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-xs font-medium text-gray-300">
                    {topPlayer.player.position}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <motion.p 
                  className="text-4xl font-black text-yellow-400"
                  key={topPlayer.score}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  {topPlayer.score.toFixed(1)}
                </motion.p>
                <p className="text-xs text-yellow-600">points</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard entries */}
      <div className="divide-y divide-gray-700/50">
        <AnimatePresence mode="popLayout">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No statistics recorded yet</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <LeaderboardEntry 
                key={entry.player.id}
                entry={entry}
                rank={index + 1}
                isPoG={index === 0}
                maxScore={maxScore}
                teamColor={entry.team.name === teamA?.name ? teamAColor : teamBColor}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Formula explanation */}
      <div className="p-4 bg-gray-800/50 border-t border-gray-700">
        <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
          <Award className="w-3 h-3" />
          Scoring Formula:
        </p>
        <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
          <span>• Kills × 1.0</span>
          <span>• Blocks × 1.5</span>
          <span>• Aces × 1.2</span>
          <span>• Digs × 1.0</span>
          <span>• Errors × -1.0</span>
        </div>
      </div>
    </motion.div>
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
  maxScore: number
  teamColor: string
}

function LeaderboardEntry({ entry, rank, isPoG, maxScore, teamColor }: LeaderboardEntryProps) {
  const getRankDisplay = (rank: number): { icon: React.ReactNode; bg: string; text: string } => {
    switch (rank) {
      case 1:
        return { 
          icon: <Crown className="w-4 h-4" />,
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', 
          text: 'text-yellow-900' 
        }
      case 2:
        return { 
          icon: <Medal className="w-4 h-4" />,
          bg: 'bg-gradient-to-br from-gray-300 to-gray-400', 
          text: 'text-gray-700' 
        }
      case 3:
        return { 
          icon: <Medal className="w-4 h-4" />,
          bg: 'bg-gradient-to-br from-amber-600 to-amber-700', 
          text: 'text-amber-100' 
        }
      default:
        return { 
          icon: <span>{rank}</span>,
          bg: 'bg-gray-700', 
          text: 'text-gray-300' 
        }
    }
  }

  const rankDisplay = getRankDisplay(rank)
  const progressWidth = maxScore > 0 ? (entry.score / maxScore) * 100 : 0

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`p-3 flex items-center gap-3 ${isPoG ? 'bg-yellow-500/5' : ''}`}
    >
      {/* Rank */}
      <motion.div 
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${rankDisplay.bg} ${rankDisplay.text}`}
        whileHover={{ scale: 1.1 }}
      >
        {rankDisplay.icon}
      </motion.div>

      {/* Player avatar */}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="relative"
      >
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 border-2"
        style={{ borderColor: teamColor }}
        >
          {entry.player.photo_url ? (
            <img 
              src={entry.player.photo_url} 
              alt={entry.player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-bold text-gray-300 text-lg">
              {entry.player.name.charAt(0)}
            </span>
          )}
        </div>
      </motion.div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white truncate">
            {entry.player.name}
          </p>
          {isPoG && <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">#{entry.player.jersey_number}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-400">{entry.player.position}</span>
        </div>
        
        {/* Mini progress bar */}
        <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: teamColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progressWidth}%` }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </div>
      </div>

      {/* Score */}
      <motion.div 
        className="text-right"
        whileHover={{ scale: 1.1 }}
      >
        <p className="font-bold text-white text-lg">
          {entry.score.toFixed(1)}
        </p>
      </motion.div>
    </motion.div>
  )
}

export default PerformanceLeaderboard
