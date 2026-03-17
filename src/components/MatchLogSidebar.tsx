'use client'

import { useGameStore } from '@/store/gameStore'
import type { MatchLogEntry, ActionType } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, 
  Shield, 
  Zap, 
  Hand, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Undo2,
  History,
  Circle
} from 'lucide-react'

// Icons for each action type
const actionIcons: Record<ActionType, React.ReactNode> = {
  attack_kill: <Flame className="w-3 h-3" />,
  attack_error: <XCircle className="w-3 h-3" />,
  attack_attempt: <Activity className="w-3 h-3" />,
  block_point: <Shield className="w-3 h-3" />,
  block_error: <XCircle className="w-3 h-3" />,
  block_assist: <Hand className="w-3 h-3" />,
  service_ace: <Zap className="w-3 h-3" />,
  service_error: <XCircle className="w-3 h-3" />,
  reception_perfect: <CheckCircle2 className="w-3 h-3" />,
  reception_good: <CheckCircle2 className="w-3 h-3" />,
  reception_error: <XCircle className="w-3 h-3" />,
  set_excellent: <Hand className="w-3 h-3" />,
  set_good: <Hand className="w-3 h-3" />,
  dig_excellent: <Shield className="w-3 h-3" />,
  dig_good: <Shield className="w-3 h-3" />,
  dig_error: <XCircle className="w-3 h-3" />,
  score_change: <Activity className="w-3 h-3" />,
  rotation_change: <Activity className="w-3 h-3" />,
  substitution: <History className="w-3 h-3" />,
  libero_change: <Shield className="w-3 h-3" />,
}

const actionLabels: Record<ActionType, string> = {
  attack_kill: 'Kill',
  attack_error: 'Attack Error',
  attack_attempt: 'Attack',
  block_point: 'Block',
  block_error: 'Block Error',
  block_assist: 'Block Assist',
  service_ace: 'Ace',
  service_error: 'Service Err',
  reception_perfect: 'Perfect',
  reception_good: 'Good Rec',
  reception_error: 'Rec Error',
  set_excellent: 'Great Set',
  set_good: 'Set',
  dig_excellent: 'Great Dig',
  dig_good: 'Dig',
  dig_error: 'Dig Error',
  score_change: 'Score',
  rotation_change: 'Rotate',
  substitution: 'Sub',
  libero_change: 'Libero',
}

const actionColors: Record<ActionType, string> = {
  attack_kill: 'bg-green-500',
  attack_error: 'bg-red-500',
  attack_attempt: 'bg-gray-500',
  block_point: 'bg-purple-500',
  block_error: 'bg-red-400',
  block_assist: 'bg-indigo-500',
  service_ace: 'bg-yellow-500',
  service_error: 'bg-red-600',
  reception_perfect: 'bg-green-600',
  reception_good: 'bg-blue-500',
  reception_error: 'bg-red-500',
  set_excellent: 'bg-teal-500',
  set_good: 'bg-cyan-500',
  dig_excellent: 'bg-cyan-600',
  dig_good: 'bg-sky-500',
  dig_error: 'bg-red-400',
  score_change: 'bg-blue-600',
  rotation_change: 'bg-orange-500',
  substitution: 'bg-pink-500',
  libero_change: 'bg-yellow-400',
}

// Group logs by rally (consecutive actions)
const groupByRally = (logs: MatchLogEntry[]): MatchLogEntry[][] => {
  const rallies: MatchLogEntry[][] = []
  let currentRally: MatchLogEntry[] = []
  
  logs.forEach((log, index) => {
    currentRally.push(log)
    
    // End rally on score change or every 5 actions
    if (log.action_type === 'score_change' || currentRally.length >= 5) {
      if (currentRally.length > 0) {
        rallies.push(currentRally)
        currentRally = []
      }
    }
  })
  
  // Add remaining
  if (currentRally.length > 0) {
    rallies.push(currentRally)
  }
  
  return rallies
}

export function MatchLogSidebar() {
  const { matchLogs, teamA, teamB, undoLastAction, undoStack } = useGameStore()

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getTeamName = (teamId: string): string => {
    if (teamId === teamA?.id) return teamA.name
    if (teamId === teamB?.id) return teamB.name
    return 'Unknown'
  }

  const getTeamColor = (teamId: string): string => {
    if (teamId === teamA?.id) return teamA?.color || '#3b82f6'
    if (teamId === teamB?.id) return teamB?.color || '#ef4444'
    return '#6b7280'
  }

  // Reverse to show newest first
  const sortedLogs = [...matchLogs].reverse()
  const rallyGroups = groupByRally(sortedLogs)

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full border border-gray-700"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-white">
            Match Log
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={undoLastAction}
          disabled={undoStack.length === 0}
          className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 text-gray-300"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </motion.button>
      </div>

      {/* Log entries - Timeline format */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {sortedLogs.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <History className="w-14 h-14 mx-auto mb-4 text-gray-600" />
            </motion.div>
            <p className="text-gray-500 font-medium">No actions recorded yet</p>
            <p className="text-gray-600 text-sm mt-1">Start tracking the match!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedLogs.map((log, index) => (
              <TimelineEntry
                key={log.id}
                log={log}
                teamName={getTeamName(log.team_id)}
                teamColor={getTeamColor(log.team_id)}
                actionLabel={actionLabels[log.action_type] || log.action_type}
                actionColor={actionColors[log.action_type] || 'bg-gray-500'}
                actionIcon={actionIcons[log.action_type] || <Activity className="w-3 h-3" />}
                time={formatTime(log.timestamp)}
                isFirst={index === 0}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Stats summary */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 flex items-center gap-1">
            <Circle className="w-2 h-2 fill-current" />
            {matchLogs.length} actions
          </span>
          <span className="text-gray-500">
            Rally groups: {rallyGroups.length}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

interface TimelineEntryProps {
  log: MatchLogEntry
  teamName: string
  teamColor: string
  actionLabel: string
  actionColor: string
  actionIcon: React.ReactNode
  time: string
  isFirst: boolean
}

function TimelineEntry({ log, teamName, teamColor, actionLabel, actionColor, actionIcon, time, isFirst }: TimelineEntryProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative pl-6"
    >
      {/* Timeline line */}
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-700" />
      
      {/* Timeline dot */}
      <motion.div 
        className="absolute left-1 top-3 w-3 h-3 rounded-full border-2 border-gray-600 z-10"
        style={{ backgroundColor: isFirst ? teamColor : 'transparent' }}
        animate={isFirst ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.5, repeat: isFirst ? Infinity : 0, repeatDelay: 2 }}
      />

      {/* Content card */}
      <motion.div 
        whileHover={{ scale: 1.01, x: 4 }}
        className={`
          p-3 rounded-xl border transition-all
          ${isFirst 
            ? 'bg-gray-800 border-gray-600 shadow-lg shadow-black/20' 
            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
          }
        `}
      >
        <div className="flex items-start justify-between gap-2">
          {/* Action badge */}
          <div className="flex items-center gap-2">
            <motion.span 
              className={`${actionColor} text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1`}
              whileHover={{ scale: 1.1 }}
            >
              {actionIcon}
              {actionLabel}
            </motion.span>
          </div>
          
          {/* Time */}
          <span className="text-[10px] text-gray-500 flex-shrink-0 font-mono">
            {time}
          </span>
        </div>
        
        {/* Player info */}
        <div className="mt-2 flex items-center gap-2">
          {log.player && (
            <>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: teamColor }}
              >
                {log.player.photo_url ? (
                  <img src={log.player.photo_url} alt={log.player.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  log.player.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {log.player.name}
                </p>
                <p className="text-[10px] text-gray-500">
                  #{log.player.jersey_number} • {teamName}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default MatchLogSidebar
