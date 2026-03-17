'use client'

import { useGameStore } from '@/store/gameStore'
import type { ActionType } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, 
  Shield, 
  Zap, 
  Hand, 
  CheckCircle2, 
  XCircle,
  ArrowUpCircle,
  Users,
  Target,
  Activity,
  Plus
} from 'lucide-react'
import { useState } from 'react'

// Icons for each stat type
const statIcons: Record<ActionType, React.ReactNode> = {
  attack_kill: <Flame className="w-4 h-4" />,
  attack_error: <XCircle className="w-4 h-4" />,
  attack_attempt: <Target className="w-4 h-4" />,
  block_point: <Shield className="w-4 h-4" />,
  block_error: <XCircle className="w-4 h-4" />,
  block_assist: <Users className="w-4 h-4" />,
  service_ace: <Zap className="w-4 h-4" />,
  service_error: <XCircle className="w-4 h-4" />,
  reception_perfect: <CheckCircle2 className="w-4 h-4" />,
  reception_good: <CheckCircle2 className="w-4 h-4" />,
  reception_error: <XCircle className="w-4 h-4" />,
  set_excellent: <Hand className="w-4 h-4" />,
  set_good: <Hand className="w-4 h-4" />,
  dig_excellent: <Activity className="w-4 h-4" />,
  dig_good: <Activity className="w-4 h-4" />,
  dig_error: <XCircle className="w-4 h-4" />,
  score_change: <Activity className="w-4 h-4" />,
  rotation_change: <Activity className="w-4 h-4" />,
  substitution: <Users className="w-4 h-4" />,
  libero_change: <Shield className="w-4 h-4" />,
}

// Stat categories for color coding
const getStatCategory = (action: ActionType): 'positive' | 'negative' | 'neutral' => {
  const positive = ['attack_kill', 'block_point', 'service_ace', 'reception_perfect', 'set_excellent', 'dig_excellent']
  const negative = ['attack_error', 'block_error', 'service_error', 'reception_error', 'dig_error']
  
  if (positive.includes(action)) return 'positive'
  if (negative.includes(action)) return 'negative'
  return 'neutral'
}

interface StatButton {
  action: ActionType
  label: string
  color: string
  position: 'top' | 'middle' | 'bottom'
}

interface StatButtonGroupProps {
  title: string
  buttons: StatButton[]
}

export function StatButtonGroup({ title, buttons }: StatButtonGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((btn) => (
          <StatButtonComponent key={btn.action} {...btn} />
        ))}
      </div>
    </div>
  )
}

function StatButtonComponent({ action, label, color, position }: StatButton) {
  const { 
    recordStat, 
    activeTeam, 
    activePosition,
    teamAPositions,
    teamBPositions,
    teamA,
    teamB 
  } = useGameStore()

  const [showFloating, setShowFloating] = useState(false)

  const positions = activeTeam === 'team_a' ? teamAPositions : teamBPositions
  const activePlayer = positions.find(p => p.position === activePosition)?.player

  // Get team color for glow effect
  const teamColor = activeTeam === 'team_a' ? (teamA?.color || '#3b82f6') : (teamB?.color || '#ef4444')

  const category = getStatCategory(action)

  const handleClick = () => {
    if (activePlayer) {
      recordStat(activePlayer.id, action, activePosition)
      // Show floating animation
      setShowFloating(true)
      setTimeout(() => setShowFloating(false), 600)
    }
  }

  const getPositionClass = () => {
    switch (position) {
      case 'top':
        return 'row-start-1'
      case 'middle':
        return 'row-start-2'
      case 'bottom':
        return 'row-start-3'
    }
  }

  // Get background color based on category
  const getBackgroundColor = () => {
    switch (category) {
      case 'positive':
        return '#22c55e' // green-500
      case 'negative':
        return '#ef4444' // red-500
      case 'neutral':
        return '#64748b' // slate-500
    }
  }

  const bgColor = color || getBackgroundColor()

  return (
    <div className={`relative ${getPositionClass()}`}>
      <motion.button
        onClick={handleClick}
        disabled={!activePlayer}
        initial={false}
        whileHover={activePlayer ? { scale: 1.05, boxShadow: `0 8px 25px ${bgColor}60` } : {}}
        whileTap={activePlayer ? { scale: 0.92 } : {}}
        style={{ backgroundColor: activePlayer ? bgColor : '#374151' }}
        className={`
          w-full py-3 px-2 rounded-xl shadow-lg flex flex-col items-center justify-center gap-1
          text-white font-bold text-xs sm:text-sm
          transition-all
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
        `}
      >
        {/* Icon */}
        <div className="flex items-center gap-1">
          {statIcons[action]}
          <span>{label}</span>
        </div>
      </motion.button>

      {/* Floating +1 animation */}
      <AnimatePresence>
        {showFloating && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -40, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-start justify-center pointer-events-none"
          >
            <span className={`text-lg font-bold ${category === 'positive' ? 'text-green-400' : category === 'negative' ? 'text-red-400' : 'text-blue-400'}`}>
              +1
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Attack stat buttons
export function AttackButtons() {
  const buttons: StatButton[] = [
    { action: 'attack_kill', label: 'KILL', color: '#22c55e', position: 'top' },
    { action: 'attack_error', label: 'ERROR', color: '#ef4444', position: 'middle' },
    { action: 'attack_attempt', label: 'ATT', color: '#64748b', position: 'bottom' },
  ]
  return <StatButtonGroup title="Attacks" buttons={buttons} />
}

// Block stat buttons
export function BlockButtons() {
  const buttons: StatButton[] = [
    { action: 'block_point', label: 'BLOCK', color: '#a855f7', position: 'top' },
    { action: 'block_assist', label: 'BLK AST', color: '#6366f1', position: 'middle' },
    { action: 'block_error', label: 'BLK ERR', color: '#f87171', position: 'bottom' },
  ]
  return <StatButtonGroup title="Blocks" buttons={buttons} />
}

// Service stat buttons
export function ServiceButtons() {
  const buttons: StatButton[] = [
    { action: 'service_ace', label: 'ACE', color: '#eab308', position: 'top' },
    { action: 'service_error', label: 'SVC ERR', color: '#dc2626', position: 'middle' },
  ]
  return <StatButtonGroup title="Service" buttons={buttons} />
}

// Reception stat buttons (universal)
export function ReceptionButtons() {
  const buttons: StatButton[] = [
    { action: 'reception_perfect', label: 'PERFECT', color: '#16a34a', position: 'top' },
    { action: 'reception_good', label: 'GOOD', color: '#3b82f6', position: 'middle' },
    { action: 'reception_error', label: 'ERROR', color: '#ef4444', position: 'bottom' },
  ]
  return <StatButtonGroup title="Reception" buttons={buttons} />
}

// Setter buttons
export function SetterButtons() {
  const buttons: StatButton[] = [
    { action: 'set_excellent', label: 'EXC SET', color: '#14b8a6', position: 'top' },
  ]
  return <StatButtonGroup title="Setting" buttons={buttons} />
}

// Dig buttons
export function DigButtons() {
  const buttons: StatButton[] = [
    { action: 'dig_excellent', label: 'EXC DIG', color: '#06b6d4', position: 'top' },
    { action: 'dig_good', label: 'GOOD DIG', color: '#0ea5e9', position: 'middle' },
    { action: 'dig_error', label: 'DIG ERR', color: '#f87171', position: 'bottom' },
  ]
  return <StatButtonGroup title="Defense" buttons={buttons} />
}

// All stat buttons panel
export function StatButtonsPanel() {
  const { activeTeam, teamAPositions, teamBPositions, teamA, teamB } = useGameStore()
  
  const positions = activeTeam === 'team_a' ? teamAPositions : teamBPositions
  const activePosition = useGameStore(state => state.activePosition)
  const activePlayer = positions.find(p => p.position === activePosition)?.player

  // Get team color
  const teamColor = activeTeam === 'team_a' ? (teamA?.color || '#3b82f6') : (teamB?.color || '#ef4444')

  if (!activePlayer) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4"
          >
            <Hand className="w-8 h-8 text-gray-500" />
          </motion.div>
          <p className="text-gray-400 font-medium">
            Select a player on the court
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Tap a player to record stats
          </p>
        </div>
      </motion.div>
    )
  }

  const playerPosition = activePlayer.position

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 border border-gray-700"
    >
      {/* Active player indicator */}
      <motion.div 
        className="flex items-center justify-center gap-4 pb-4 border-b border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="relative"
        >
          {activePlayer.photo_url ? (
            <img 
              src={activePlayer.photo_url} 
              alt={activePlayer.name} 
              className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
              style={{ borderColor: teamColor }}
            />
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: teamColor }}
            >
              {activePlayer.name.charAt(0)}
            </div>
          )}
          {/* Position badge */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{playerPosition}</span>
          </div>
        </motion.div>
        <div>
          <motion.p 
            className="font-bold text-white text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {activePlayer.name}
          </motion.p>
          <p className="text-gray-400 text-sm">
            #{activePlayer.jersey_number} • {activePlayer.is_libero && 'Libero • '}{playerPosition}
          </p>
        </div>
      </motion.div>

      {/* Position-based stat buttons */}
      <div className="space-y-4 mt-4">
        {/* Universal - all players */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ReceptionButtons />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ServiceButtons />
        </motion.div>

        {/* Spikers - OH, OP, MB */}
        {(playerPosition === 'OH' || playerPosition === 'OP' || playerPosition === 'MB') && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AttackButtons />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <BlockButtons />
            </motion.div>
          </>
        )}

        {/* Setters */}
        {playerPosition === 'S' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SetterButtons />
          </motion.div>
        )}

        {/* Liberos */}
        {playerPosition === 'L' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DigButtons />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default StatButtonsPanel
