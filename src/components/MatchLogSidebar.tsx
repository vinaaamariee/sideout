'use client'

import { useGameStore } from '@/store/gameStore'
import type { MatchLogEntry, ActionType } from '@/types'

const actionLabels: Record<ActionType, string> = {
  attack_kill: 'Attack Kill',
  attack_error: 'Attack Error',
  attack_attempt: 'Attack Attempt',
  block_point: 'Block Point',
  block_error: 'Block Error',
  block_assist: 'Block Assist',
  service_ace: 'Service Ace',
  service_error: 'Service Error',
  reception_perfect: 'Perfect Reception',
  reception_good: 'Good Reception',
  reception_error: 'Reception Error',
  set_excellent: 'Excellent Set',
  set_good: 'Good Set',
  dig_excellent: 'Excellent Dig',
  dig_good: 'Good Dig',
  dig_error: 'Dig Error',
  score_change: 'Score Change',
  rotation_change: 'Rotation',
  substitution: 'Substitution',
  libero_change: 'Libero Change',
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

  // Reverse to show newest first
  const sortedLogs = [...matchLogs].reverse()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Match Log
        </h2>
        <button
          onClick={undoLastAction}
          disabled={undoStack.length === 0}
          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Undo
        </button>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedLogs.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No actions recorded yet</p>
          </div>
        ) : (
          sortedLogs.map((log) => (
            <LogEntry
              key={log.id}
              log={log}
              teamName={getTeamName(log.team_id)}
              actionLabel={actionLabels[log.action_type] || log.action_type}
              actionColor={actionColors[log.action_type] || 'bg-gray-500'}
              time={formatTime(log.timestamp)}
            />
          ))
        )}
      </div>

      {/* Stats summary */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {matchLogs.length} actions recorded
        </p>
      </div>
    </div>
  )
}

interface LogEntryProps {
  log: MatchLogEntry
  teamName: string
  actionLabel: string
  actionColor: string
  time: string
}

function LogEntry({ log, teamName, actionLabel, actionColor, time }: LogEntryProps) {
  return (
    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-start gap-2">
        {/* Action badge */}
        <span className={`${actionColor} text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0`}>
          {actionLabel}
        </span>
        
        <div className="flex-1 min-w-0">
          {/* Player name */}
          {log.player && (
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {log.player.name} #{log.player.jersey_number}
            </p>
          )}
          
          {/* Team and position */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {teamName} • Pos {log.position}
          </p>
        </div>

        {/* Time */}
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          {time}
        </span>
      </div>
    </div>
  )
}

export default MatchLogSidebar
