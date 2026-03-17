'use client'

import { useGameStore } from '@/store/gameStore'
import type { CourtPosition, Player } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, User, ArrowRight } from 'lucide-react'

interface CourtProps {
  team: 'team_a' | 'team_b'
  compact?: boolean
  onPlayerSelect?: (player: Player | null) => void
}

export function Court({ team, compact = false, onPlayerSelect }: CourtProps) {
  const { 
    teamAPositions, 
    teamBPositions, 
    servingTeam, 
    activePosition, 
    activeTeam,
    setActivePosition,
    teamA,
    teamB 
  } = useGameStore()

  const positions = team === 'team_a' ? teamAPositions : teamBPositions
  const isServing = servingTeam === team
  const isActiveTeam = activeTeam === team

  const handlePositionClick = (position: number) => {
    if (isActiveTeam) {
      setActivePosition(position, team)
    }
  }

  // Get team colors
  const teamColor = team === 'team_a' ? (teamA?.color || '#3b82f6') : (teamB?.color || '#ef4444')

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${compact ? 'w-64 h-48' : 'w-full h-80'} bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl border-2 overflow-hidden`}
      style={{ 
        borderColor: isServing ? '#fbbf24' : (isActiveTeam ? teamColor : '#94a3b8'),
        boxShadow: isActiveTeam ? `0 0 20px ${teamColor}40` : 'none'
      }}
    >
      {/* Court Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            rgba(255,255,255,0.3) 20px,
            rgba(255,255,255,0.3) 21px
          )`
        }} />
      </div>

      {/* Court lines */}
      <div className="absolute inset-3 border-2 border-white/60 dark:border-gray-400/60 rounded-lg">
        {/* Service line */}
        <div className="absolute top-1/3 left-0 right-0 border-t-2 border-white/60 dark:border-gray-400/60"></div>
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60 dark:bg-gray-400/60"></div>
      </div>

      {/* Net */}
      <motion.div 
        className="absolute top-1/3 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400"
        animate={{ 
          boxShadow: isServing ? ['0 0 10px #fbbf24', '0 0 20px #fbbf24'] : 'none'
        }}
        transition={{ duration: 0.5, repeat: isServing ? Infinity : 0, repeatType: "reverse" }}
      />

      {/* Position labels */}
      <div className="absolute top-2 left-3 text-xs text-blue-800/60 dark:text-blue-200/60 font-medium uppercase tracking-wider">
        {isActiveTeam ? 'Your Court' : `${team === 'team_a' ? teamA?.name : teamB?.name}'s Court`}
      </div>

      {/* Court positions */}
      <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-2">
        <AnimatePresence mode="popLayout">
          {positions.map((pos) => (
            <CourtPositionSlot
              key={pos.position}
              position={pos}
              isActive={isActiveTeam && activePosition === pos.position}
              isServing={isServing && pos.position === 1}
              onClick={() => handlePositionClick(pos.position)}
              compact={compact}
              teamColor={teamColor}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Serving indicator */}
      {isServing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-yellow-400/90 rounded-full"
        >
          <Zap className="w-3 h-3 text-yellow-800 fill-yellow-800" />
          <span className="text-xs font-bold text-yellow-800">Serving</span>
        </motion.div>
      )}
    </motion.div>
  )
}

interface CourtPositionSlotProps {
  position: CourtPosition
  isActive: boolean
  isServing: boolean
  onClick: () => void
  compact: boolean
  teamColor: string
}

function CourtPositionSlot({ position, isActive, isServing, onClick, compact, teamColor }: CourtPositionSlotProps) {
  const { player, position: posNum } = position

  // Volleyball position numbering (1-6 in rotation order, displayed as standard formation)
  const getPositionLabel = (pos: number): string => {
    const labels: Record<number, string> = {
      1: '4',  // Front left (opposite to setter in serve receive)
      2: '3',  // Front center (middle)
      3: '2',  // Front right (outside hitter)
      4: '1',  // Back left (outside hitter)
      5: '6',  // Back center (libero/defense)
      6: '5',  // Back right (setter)
    }
    return labels[pos] || pos.toString()
  }

  // Get position name
  const getPositionName = (pos: number): string => {
    const names: Record<number, string> = {
      1: 'OH',
      2: 'MB',
      3: 'OP',
      4: 'OH',
      5: 'L',
      6: 'S',
    }
    return names[pos] || ''
  }

  const sizeClass = compact ? 'w-10 h-10' : 'w-16 h-16'
  const textSizeClass = compact ? 'text-[8px]' : 'text-xs'
  const posTextClass = compact ? 'text-[6px]' : 'text-[10px]'

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'S': return 'bg-orange-500'
      case 'OH': return 'bg-blue-500'
      case 'OP': return 'bg-purple-500'
      case 'MB': return 'bg-green-500'
      case 'L': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        backgroundColor: isActive ? `${teamColor}20` : 'rgba(255,255,255,0.9)',
        borderColor: isActive ? teamColor : isServing ? '#fbbf24' : 'rgba(148, 163, 184, 0.5)'
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={player ? { scale: 1.05, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' } : {}}
      whileTap={player ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={!player}
      className={`
        relative flex flex-col items-center justify-center rounded-xl transition-all
        border-2
        ${!player ? 'bg-gray-100/50 dark:bg-gray-800/50 cursor-not-allowed' : 'cursor-pointer'}
        ${player ? 'shadow-lg' : 'shadow-sm'}
        ${compact ? 'p-1' : 'p-2'}
      `}
    >
      {/* Position number badge */}
      <motion.div 
        className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 ${
          isActive 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
        }`}
        animate={isServing ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5, repeat: isServing ? Infinity : 0 }}
      >
        {getPositionLabel(posNum)}
      </motion.div>

      {/* Libero badge */}
      {position.is_libero && player && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-md z-10"
        >
          <Shield className="w-3 h-3 text-yellow-800" />
        </motion.div>
      )}

      {/* Serving indicator */}
      {isServing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
        >
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        </motion.div>
      )}

      {/* Player content */}
      {player ? (
        <>
          {/* Player photo or initials */}
          {player.photo_url ? (
            <motion.img 
              src={player.photo_url} 
              alt={player.name}
              className={`${sizeClass} rounded-full object-cover mb-1 shadow-md`}
              whileHover={{ scale: 1.1 }}
            />
          ) : (
            <motion.div 
              className={`${sizeClass} rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mb-1 shadow-md`}
            >
              <span className="text-xs font-bold text-gray-600 dark:text-gray-200">
                {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </motion.div>
          )}

          {/* Jersey number */}
          <motion.span 
            className={`${textSizeClass} font-black text-gray-800 dark:text-white`}
          >
            #{player.jersey_number}
          </motion.span>

          {/* Position */}
          <span className={`${posTextClass} font-medium text-gray-500 dark:text-gray-400 flex items-center gap-0.5`}>
            {player.position}
          </span>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <User className="w-6 h-6 text-gray-300 dark:text-gray-600" />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">Empty</span>
        </div>
      )}
    </motion.button>
  )
}

// Mini court for scoreboard display
export function MiniCourt({ team }: { team: 'team_a' | 'team_b' }) {
  return <Court team={team} compact />
}

export default Court
