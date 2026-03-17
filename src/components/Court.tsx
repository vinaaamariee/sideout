'use client'

import { useGameStore } from '@/store/gameStore'
import type { CourtPosition, Player } from '@/types'

interface CourtProps {
  team: 'team_a' | 'team_b'
  compact?: boolean
}

export function Court({ team, compact = false }: CourtProps) {
  const { 
    teamAPositions, 
    teamBPositions, 
    servingTeam, 
    activePosition, 
    activeTeam,
    setActivePosition 
  } = useGameStore()

  const positions = team === 'team_a' ? teamAPositions : teamBPositions
  const isServing = servingTeam === team
  const isActiveTeam = activeTeam === team

  const handlePositionClick = (position: number) => {
    if (isActiveTeam) {
      setActivePosition(position, team)
    }
  }

  return (
    <div className={`relative ${compact ? 'w-64 h-48' : 'w-80 h-64'} bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg border-2 ${isServing ? 'border-yellow-400' : 'border-blue-300'} overflow-hidden`}>
      {/* Court lines */}
      <div className="absolute inset-2 border-2 border-white dark:border-gray-400 rounded">
        {/* Service line */}
        <div className="absolute top-1/3 left-0 right-0 border-t-2 border-white dark:border-gray-400"></div>
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white dark:bg-gray-400"></div>
      </div>

      {/* Net */}
      <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-600 dark:bg-gray-400"></div>

      {/* Position labels */}
      <div className="absolute top-1 left-2 text-xs text-blue-800 dark:text-blue-200 font-medium">
        Serve
      </div>

      {/* Court positions */}
      <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-1">
        {positions.map((pos) => (
          <CourtPositionSlot
            key={pos.position}
            position={pos}
            isActive={isActiveTeam && activePosition === pos.position}
            isServing={isServing && pos.position === 1}
            onClick={() => handlePositionClick(pos.position)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  )
}

interface CourtPositionSlotProps {
  position: CourtPosition
  isActive: boolean
  isServing: boolean
  onClick: () => void
  compact: boolean
}

function CourtPositionSlot({ position, isActive, isServing, onClick, compact }: CourtPositionSlotProps) {
  const { player, position: posNum } = position

  const getPositionLabel = (pos: number): string => {
    const labels: Record<number, string> = {
      1: '4',
      2: '3',
      3: '2',
      4: '1',
      5: '6',
      6: '5',
    }
    return labels[pos] || pos.toString()
  }

  const sizeClass = compact ? 'w-8 h-8' : 'w-12 h-12'
  const textSizeClass = compact ? 'text-[8px]' : 'text-xs'
  const posTextClass = compact ? 'text-[6px]' : 'text-[10px]'

  return (
    <button
      onClick={onClick}
      disabled={!player}
      className={`
        relative flex flex-col items-center justify-center rounded-lg transition-all
        ${!player ? 'bg-gray-200/50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-700'}
        ${isActive ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
        ${isServing ? 'ring-2 ring-yellow-400' : ''}
        ${player ? 'hover:shadow-lg cursor-pointer' : 'cursor-default'}
        ${compact ? 'p-1' : 'p-2'}
      `}
    >
      {/* Position number badge */}
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>
        {getPositionLabel(posNum)}
      </div>

      {/* Libero badge */}
      {position.is_libero && player && (
        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
          <span className="text-[8px] font-bold text-yellow-800">L</span>
        </div>
      )}

      {/* Player content */}
      {player ? (
        <>
          {/* Player photo or initials */}
          {player.photo_url ? (
            <img 
              src={player.photo_url} 
              alt={player.name}
              className={`${sizeClass} rounded-full object-cover mb-1`}
            />
          ) : (
            <div className={`${sizeClass} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mb-1`}>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-200">
                {player.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>
          )}

          {/* Player name */}
          <span className={`${textSizeClass} font-medium text-gray-800 dark:text-white text-center leading-tight truncate w-full`}>
            {player.name}
          </span>

          {/* Jersey number */}
          <span className={`${textSizeClass} font-bold text-blue-600 dark:text-blue-400`}>
            #{player.jersey_number}
          </span>

          {/* Position */}
          <span className={`${posTextClass} text-gray-500 dark:text-gray-400`}>
            {player.position}
          </span>
        </>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">Empty</span>
      )}
    </button>
  )
}

// Mini court for scoreboard display
export function MiniCourt({ team }: { team: 'team_a' | 'team_b' }) {
  return <Court team={team} compact />
}

export default Court
