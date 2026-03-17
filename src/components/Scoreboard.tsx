'use client'

import { useGameStore } from '@/store/gameStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy, RotateCcw, Undo2, Crown, Wifi } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Scoreboard() {
  const { 
    teamA, 
    teamB, 
    teamAScore, 
    teamBScore, 
    currentSet, 
    servingTeam,
    activeTeam,
    activePosition,
    setActivePosition,
    addScore,
    rotate,
    changeServer,
    undoLastAction,
    undoStack
  } = useGameStore()

  const [scoreFlash, setScoreFlash] = useState<'team_a' | 'team_b' | null>(null)
  const [isLive, setIsLive] = useState(true)

  const handleScore = (team: 'team_a' | 'team_b') => {
    setScoreFlash(team)
    addScore(team)
    setTimeout(() => setScoreFlash(null), 500)
  }

  const getSetScore = (set: number): { teamA: number; teamB: number } => {
    if (set === currentSet) {
      return { teamA: teamAScore, teamB: teamBScore }
    }
    return { teamA: 0, teamB: 0 }
  }

  const handleRotate = () => {
    rotate()
  }

  // Team colors with glow effects
  const teamAColor = teamA?.color || '#3b82f6'
  const teamBColor = teamB?.color || '#ef4444'

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
    >
      {/* Animated Header with Live Badge */}
      <div className="relative px-6 py-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90">
        {/* Live Badge */}
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="absolute top-4 left-4 flex items-center gap-2"
        >
          <motion.div
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 8px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full"
          >
            <Wifi className="w-3 h-3 text-white animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
          </motion.div>
        </motion.div>

        {/* Set Indicator */}
        <div className="text-center pt-2">
          <motion.span 
            key={currentSet}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-4 py-1 bg-gray-700/80 rounded-full text-sm font-medium text-gray-300 border border-gray-600"
          >
            SET {currentSet}
          </motion.span>
        </div>
      </div>

      {/* Main Score Display */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className="flex-1 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative inline-block"
            >
              {teamA?.logo_url ? (
                <motion.img 
                  src={teamA.logo_url} 
                  alt={teamA.name} 
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 shadow-lg"
                  style={{ borderColor: teamAColor }}
                  animate={{ 
                    boxShadow: servingTeam === 'team_a' ? [`0 0 20px ${teamAColor}`, `0 0 40px ${teamAColor}`] : 'none'
                  }}
                  transition={{ duration: 0.5, repeat: servingTeam === 'team_a' ? Infinity : 0, repeatType: "reverse" }}
                />
              ) : (
                <motion.div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center border-4 shadow-lg"
                  style={{ backgroundColor: teamAColor, borderColor: teamAColor }}
                  animate={{ 
                    boxShadow: servingTeam === 'team_a' ? [`0 0 20px ${teamAColor}`, `0 0 40px ${teamAColor}`] : 'none'
                  }}
                  transition={{ duration: 0.5, repeat: servingTeam === 'team_a' ? Infinity : 0, repeatType: "reverse" }}
                >
                  <span className="text-3xl font-bold text-white">A</span>
                </motion.div>
              )}
              {servingTeam === 'team_a' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.div>
            <h3 className="font-bold text-white text-lg tracking-tight">{teamA?.name || 'Team A'}</h3>
          </div>

          {/* Score */}
          <div className="px-8">
            <div className="flex items-center gap-6">
              {/* Team A Score */}
              <motion.div
                key={`team_a_${teamAScore}_${scoreFlash === 'team_a'}`}
                initial={scoreFlash === 'team_a' ? { scale: 1.5, color: teamAColor } : false}
                animate={scoreFlash === 'team_a' ? { scale: 1, color: '#fff' } : { scale: 1, color: '#fff' }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={`text-6xl font-black tracking-wider ${servingTeam === 'team_a' ? 'text-white' : 'text-gray-400'}`}
              >
                {teamAScore}
              </motion.div>
              
              <span className="text-4xl text-gray-600 font-light">:</span>
              
              {/* Team B Score */}
              <motion.div
                key={`team_b_${teamBScore}_${scoreFlash === 'team_b'}`}
                initial={scoreFlash === 'team_b' ? { scale: 1.5, color: teamBColor } : false}
                animate={scoreFlash === 'team_b' ? { scale: 1, color: '#fff' } : { scale: 1, color: '#fff' }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={`text-6xl font-black tracking-wider ${servingTeam === 'team_b' ? 'text-white' : 'text-gray-400'}`}
              >
                {teamBScore}
              </motion.div>
            </div>
          </div>

          {/* Team B */}
          <div className="flex-1 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative inline-block"
            >
              {teamB?.logo_url ? (
                <motion.img 
                  src={teamB.logo_url} 
                  alt={teamB.name} 
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-4 shadow-lg"
                  style={{ borderColor: teamBColor }}
                  animate={{ 
                    boxShadow: servingTeam === 'team_b' ? [`0 0 20px ${teamBColor}`, `0 0 40px ${teamBColor}`] : 'none'
                  }}
                  transition={{ duration: 0.5, repeat: servingTeam === 'team_b' ? Infinity : 0, repeatType: "reverse" }}
                />
              ) : (
                <motion.div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center border-4 shadow-lg"
                  style={{ backgroundColor: teamBColor, borderColor: teamBColor }}
                  animate={{ 
                    boxShadow: servingTeam === 'team_b' ? [`0 0 20px ${teamBColor}`, `0 0 40px ${teamBColor}`] : 'none'
                  }}
                  transition={{ duration: 0.5, repeat: servingTeam === 'team_b' ? Infinity : 0, repeatType: "reverse" }}
                >
                  <span className="text-3xl font-bold text-white">B</span>
                </motion.div>
              )}
              {servingTeam === 'team_b' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2"
                >
                  <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </motion.div>
              )}
            </motion.div>
            <h3 className="font-bold text-white text-lg tracking-tight">{teamB?.name || 'Team B'}</h3>
          </div>
        </div>
      </div>

      {/* Score Controls */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Team A Score Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 0 25px ${teamAColor}80` }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScore('team_a')}
            style={{ backgroundColor: teamAColor }}
            className="py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            +1 Point
          </motion.button>

          {/* Team B Score Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0 0 25px ${teamBColor}80` }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleScore('team_b')}
            style={{ backgroundColor: teamBColor }}
            className="py-4 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            +1 Point
          </motion.button>
        </div>
      </div>

      {/* Rotation & Server Controls */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Rotation */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRotate}
            className="py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Rotate</span>
          </motion.button>

          {/* Change Server */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={changeServer}
            className="py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Server</span>
          </motion.button>

          {/* Undo */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={undoLastAction}
            disabled={undoStack.length === 0}
            className="py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </motion.button>
        </div>
      </div>

      {/* Team Selection */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-500 mb-3 text-center uppercase tracking-widest">
          Active Team
        </p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => useGameStore.getState().setActivePosition(1, 'team_a')}
            style={activeTeam === 'team_a' ? { backgroundColor: teamAColor } : {}}
            className={`py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTeam === 'team_a' 
                ? 'text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {activeTeam === 'team_a' && <Crown className="w-4 h-4 text-yellow-300" />}
            {teamA?.name || 'Team A'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => useGameStore.getState().setActivePosition(1, 'team_b')}
            style={activeTeam === 'team_b' ? { backgroundColor: teamBColor } : {}}
            className={`py-3 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTeam === 'team_b' 
                ? 'text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {activeTeam === 'team_b' && <Crown className="w-4 h-4 text-yellow-300" />}
            {teamB?.name || 'Team B'}
          </motion.button>
        </div>
      </div>

      {/* Serving indicator */}
      <div className="px-6 pb-6">
        <motion.div 
          initial={false}
          animate={{ 
            backgroundColor: servingTeam === 'team_a' ? `${teamAColor}20` : `${teamBColor}20`,
            borderColor: servingTeam === 'team_a' ? teamAColor : teamBColor
          }}
          className="text-center py-3 rounded-xl border-2 transition-colors"
        >
          <motion.span 
            key={servingTeam}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-white flex items-center justify-center gap-2"
          >
            <Zap className={`w-4 h-4 ${servingTeam === 'team_a' ? 'text-yellow-400' : 'text-yellow-400'} fill-yellow-400`} />
            {servingTeam === 'team_a' ? teamA?.name : teamB?.name} is serving
          </motion.span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Scoreboard
