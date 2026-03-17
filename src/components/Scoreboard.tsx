'use client'

import { useGameStore } from '@/store/gameStore'

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

  const getSetScore = (set: number): { teamA: number; teamB: number } => {
    // For now, return current scores - in a full implementation, 
    // this would track set scores separately
    if (set === currentSet) {
      return { teamA: teamAScore, teamB: teamBScore }
    }
    return { teamA: 0, teamB: 0 }
  }

  const isSetComplete = (set: number): boolean => {
    const score = getSetScore(set)
    const isFinalSet = set === 5
    const targetScore = isFinalSet ? 15 : 25
    
    if (score.teamA >= targetScore || score.teamB >= targetScore) {
      return Math.abs(score.teamA - score.teamB) >= 2
    }
    return false
  }

  const handleScore = (team: 'team_a' | 'team_b') => {
    addScore(team)
  }

  const handleRotate = () => {
    rotate()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Main Score Display */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className="flex-1 text-center">
            {teamA?.logo_url ? (
              <img src={teamA.logo_url} alt={teamA.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
            )}
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{teamA?.name || 'Team A'}</h3>
          </div>

          {/* Score */}
          <div className="px-6">
            <div className="text-center mb-2">
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                Set {currentSet}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${servingTeam === 'team_a' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                {teamAScore}
              </div>
              <span className="text-3xl text-gray-400">:</span>
              <div className={`text-5xl font-bold ${servingTeam === 'team_b' ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                {teamBScore}
              </div>
            </div>
          </div>

          {/* Team B */}
          <div className="flex-1 text-center">
            {teamB?.logo_url ? (
              <img src={teamB.logo_url} alt={teamB.name} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500 mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
            )}
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{teamB?.name || 'Team B'}</h3>
          </div>
        </div>
      </div>

      {/* Score Controls */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Team A Score Button */}
          <button
            onClick={() => handleScore('team_a')}
            className="py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            +1 Point
          </button>

          {/* Team B Score Button */}
          <button
            onClick={() => handleScore('team_b')}
            className="py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            +1 Point
          </button>
        </div>
      </div>

      {/* Rotation & Server Controls */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {/* Rotation */}
          <button
            onClick={handleRotate}
            className="py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rotate
          </button>

          {/* Change Server */}
          <button
            onClick={changeServer}
            className="py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            Change Server
          </button>

          {/* Undo */}
          <button
            onClick={undoLastAction}
            disabled={undoStack.length === 0}
            className="py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            Undo
          </button>
        </div>
      </div>

      {/* Team Selection */}
      <div className="px-4 pb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
          Select active team:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              // Set first player of team A as active
              useGameStore.getState().setActivePosition(1, 'team_a')
            }}
            className={`py-2 font-medium rounded-lg transition-colors ${
              activeTeam === 'team_a' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {teamA?.name || 'Team A'}
          </button>
          <button
            onClick={() => {
              useGameStore.getState().setActivePosition(1, 'team_b')
            }}
            className={`py-2 font-medium rounded-lg transition-colors ${
              activeTeam === 'team_b' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {teamB?.name || 'Team B'}
          </button>
        </div>
      </div>

      {/* Serving indicator */}
      <div className="px-4 pb-4">
        <div className={`text-center py-2 rounded-lg ${servingTeam === 'team_a' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          <span className="font-medium">
            {servingTeam === 'team_a' ? teamA?.name : teamB?.name} is serving
          </span>
        </div>
      </div>
    </div>
  )
}

export default Scoreboard
