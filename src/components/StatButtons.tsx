'use client'

import { useGameStore } from '@/store/gameStore'
import type { ActionType } from '@/types'

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
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
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
    teamBPositions 
  } = useGameStore()

  const positions = activeTeam === 'team_a' ? teamAPositions : teamBPositions
  const activePlayer = positions.find(p => p.position === activePosition)?.player

  const handleClick = () => {
    if (activePlayer) {
      recordStat(activePlayer.id, action, activePosition)
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

  return (
    <button
      onClick={handleClick}
      disabled={!activePlayer}
      className={`
        ${getPositionClass()}
        ${color} 
        text-white font-bold py-3 px-2 rounded-lg shadow-md 
        hover:shadow-lg hover:scale-105 active:scale-95 
        transition-all text-xs sm:text-sm
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      `}
    >
      {label}
    </button>
  )
}

// Attack stat buttons
export function AttackButtons() {
  const buttons: StatButton[] = [
    { action: 'attack_kill', label: 'KILL', color: 'bg-green-500 hover:bg-green-600', position: 'top' },
    { action: 'attack_error', label: 'ERROR', color: 'bg-red-500 hover:bg-red-600', position: 'middle' },
    { action: 'attack_attempt', label: 'ATT', color: 'bg-gray-500 hover:bg-gray-600', position: 'bottom' },
  ]
  return <StatButtonGroup title="Attacks" buttons={buttons} />
}

// Block stat buttons
export function BlockButtons() {
  const buttons: StatButton[] = [
    { action: 'block_point', label: 'BLOCK', color: 'bg-purple-500 hover:bg-purple-600', position: 'top' },
    { action: 'block_assist', label: 'BLK AST', color: 'bg-indigo-500 hover:bg-indigo-600', position: 'middle' },
    { action: 'block_error', label: 'BLK ERR', color: 'bg-red-400 hover:bg-red-500', position: 'bottom' },
  ]
  return <StatButtonGroup title="Blocks" buttons={buttons} />
}

// Service stat buttons
export function ServiceButtons() {
  const buttons: StatButton[] = [
    { action: 'service_ace', label: 'ACE', color: 'bg-yellow-500 hover:bg-yellow-600', position: 'top' },
    { action: 'service_error', label: 'SVC ERR', color: 'bg-red-600 hover:bg-red-700', position: 'middle' },
  ]
  return <StatButtonGroup title="Service" buttons={buttons} />
}

// Reception stat buttons (universal)
export function ReceptionButtons() {
  const buttons: StatButton[] = [
    { action: 'reception_perfect', label: 'PERFECT', color: 'bg-green-600 hover:bg-green-700', position: 'top' },
    { action: 'reception_good', label: 'GOOD', color: 'bg-blue-500 hover:bg-blue-600', position: 'middle' },
    { action: 'reception_error', label: 'ERROR', color: 'bg-red-500 hover:bg-red-600', position: 'bottom' },
  ]
  return <StatButtonGroup title="Reception" buttons={buttons} />
}

// Setter buttons
export function SetterButtons() {
  const buttons: StatButton[] = [
    { action: 'set_excellent', label: 'EXC SET', color: 'bg-teal-500 hover:bg-teal-600', position: 'top' },
  ]
  return <StatButtonGroup title="Setting" buttons={buttons} />
}

// Dig buttons
export function DigButtons() {
  const buttons: StatButton[] = [
    { action: 'dig_excellent', label: 'EXC DIG', color: 'bg-cyan-500 hover:bg-cyan-600', position: 'top' },
    { action: 'dig_good', label: 'GOOD DIG', color: 'bg-sky-500 hover:bg-sky-600', position: 'middle' },
    { action: 'dig_error', label: 'DIG ERR', color: 'bg-red-400 hover:bg-red-500', position: 'bottom' },
  ]
  return <StatButtonGroup title="Defense" buttons={buttons} />
}

// All stat buttons panel
export function StatButtonsPanel() {
  const { activeTeam, teamAPositions, teamBPositions } = useGameStore()
  
  const positions = activeTeam === 'team_a' ? teamAPositions : teamBPositions
  const activePosition = useGameStore(state => state.activePosition)
  const activePlayer = positions.find(p => p.position === activePosition)?.player

  if (!activePlayer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Select a player on the court to record stats
        </p>
      </div>
    )
  }

  const playerPosition = activePlayer.position

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-4">
      {/* Active player indicator */}
      <div className="flex items-center justify-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {activePlayer.photo_url ? (
            <img src={activePlayer.photo_url} alt={activePlayer.name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            activePlayer.name.charAt(0)
          )}
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white">
            {activePlayer.name} #{activePlayer.jersey_number}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {playerPosition} {activePlayer.is_libero && '(Libero)'}
          </p>
        </div>
      </div>

      {/* Position-based stat buttons */}
      <div className="space-y-3">
        {/* Universal - all players */}
        <ReceptionButtons />
        <ServiceButtons />

        {/* Spikers - OH, OP, MB */}
        {(playerPosition === 'OH' || playerPosition === 'OP' || playerPosition === 'MB') && (
          <>
            <AttackButtons />
            <BlockButtons />
          </>
        )}

        {/* Setters */}
        {playerPosition === 'S' && (
          <SetterButtons />
        )}

        {/* Liberos */}
        {playerPosition === 'L' && (
          <DigButtons />
        )}
      </div>
    </div>
  )
}

export default StatButtonsPanel
