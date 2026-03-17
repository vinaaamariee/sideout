import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { 
  GameState, 
  Team, 
  Player, 
  MatchLogEntry, 
  ActionType, 
  PlayerStats,
  CourtPosition 
} from '@/types'

const createEmptyPlayerStats = (): PlayerStats => ({
  id: '',
  match_id: '',
  player_id: '',
  team_id: '',
  attacks: 0,
  kills: 0,
  errors: 0,
  blocks: 0,
  solo_blocks: 0,
  block_assists: 0,
  aces: 0,
  service_errors: 0,
  assists: 0,
  excellent_sets: 0,
  perfect_receptions: 0,
  good_receptions: 0,
  reception_errors: 0,
  excellent_digs: 0,
  good_digs: 0,
  dig_errors: 0,
})

const createEmptyCourtPosition = (position: number): CourtPosition => ({
  position,
  player: null,
  is_libero: false,
})

interface GameStore extends GameState {
  // Match actions
  setMatch: (matchId: string, teamA: Team, teamB: Team) => void
  endMatch: () => void
  resetMatch: () => void
  
  // Score actions
  addScore: (team: 'team_a' | 'team_b') => void
  undoLastAction: () => void
  
  // Rotation
  rotate: () => void
  setTeamPositions: (team: 'team_a' | 'team_b', positions: Player[]) => void
  
  // Serving
  changeServer: () => void
  
  // Stats actions
  recordStat: (
    playerId: string, 
    actionType: ActionType, 
    position: number
  ) => void
  
  // Active position
  setActivePosition: (position: number, team: 'team_a' | 'team_b') => void
  
  // Libero
  toggleLibero: (position: number, team: 'team_a' | 'team_b') => void
  
  // Substitution
  substitute: (
    fromPosition: number, 
    toPosition: number, 
    team: 'team_a' | 'team_b'
  ) => void
  
  // Helpers
  getCurrentStats: (playerId: string) => PlayerStats
  getTeamStats: (team: 'team_a' | 'team_b') => Record<string, PlayerStats>
  getPerformanceLeaderboard: () => { player: Player; score: number; team: Team }[]
}

// Helper to compute performance score
const computePerformanceScore = (stats: PlayerStats): number => {
  return (
    (stats.kills * 1.0) +
    (stats.blocks * 1.5) +
    (stats.solo_blocks * 1.5) +
    (stats.block_assists * 1.0) +
    (stats.aces * 1.2) +
    (stats.assists * 0.5) +
    (stats.excellent_digs * 1.0) +
    (stats.excellent_sets * 0.5) -
    (stats.errors) -
    (stats.service_errors) -
    (stats.reception_errors) -
    (stats.dig_errors)
  )
}

const initialState: GameState = {
  matchId: null,
  teamA: null,
  teamB: null,
  teamAScore: 0,
  teamBScore: 0,
  currentSet: 1,
  servingTeam: 'team_a',
  teamAPositions: Array.from({ length: 6 }, (_, i) => createEmptyCourtPosition(i + 1)),
  teamBPositions: Array.from({ length: 6 }, (_, i) => createEmptyCourtPosition(i + 1)),
  teamAStats: {},
  teamBStats: {},
  matchLogs: [],
  undoStack: [],
  activePosition: 1,
  activeTeam: 'team_a',
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMatch: (matchId, teamA, teamB) => {
        set({
          matchId,
          teamA,
          teamB,
          teamAScore: 0,
          teamBScore: 0,
          currentSet: 1,
          servingTeam: 'team_a',
          teamAPositions: Array.from({ length: 6 }, (_, i) => createEmptyCourtPosition(i + 1)),
          teamBPositions: Array.from({ length: 6 }, (_, i) => createEmptyCourtPosition(i + 1)),
          teamAStats: {},
          teamBStats: {},
          matchLogs: [],
          undoStack: [],
        })
      },

      endMatch: () => {
        set({ 
          matchId: null,
          teamA: null,
          teamB: null 
        })
      },

      resetMatch: () => {
        set(initialState)
      },

      addScore: (team) => {
        const state = get()
        // Save current state to undo stack
        const undoState: GameState = JSON.parse(JSON.stringify(state))
        
        if (team === 'team_a') {
          set({
            teamAScore: state.teamAScore + 1,
            servingTeam: 'team_a',
            undoStack: [...state.undoStack.slice(-19), undoState],
            matchLogs: [
              ...state.matchLogs,
              {
                id: uuidv4(),
                match_id: state.matchId || '',
                player_id: state.teamAPositions[0]?.player?.id || '',
                team_id: state.teamA?.id || '',
                action_type: 'score_change',
                position: 1,
                timestamp: new Date().toISOString(),
              },
            ],
          })
        } else {
          set({
            teamBScore: state.teamBScore + 1,
            servingTeam: 'team_b',
            undoStack: [...state.undoStack.slice(-19), undoState],
          })
        }
      },

      undoLastAction: () => {
        const state = get()
        if (state.undoStack.length === 0) return
        
        const previousState = state.undoStack[state.undoStack.length - 1]
        set({
          ...previousState,
          undoStack: state.undoStack.slice(0, -1),
        })
      },

      rotate: () => {
        const state = get()
        const undoState: GameState = JSON.parse(JSON.stringify(state))
        
        // Standard rotation: 1→6→5→4→3→2→1
        const rotatePositions = (positions: CourtPosition[]): CourtPosition[] => {
          const newPositions = [...positions]
          const firstPlayer = newPositions.shift()
          if (firstPlayer) {
            newPositions.push(firstPlayer)
          }
          return newPositions.map((p, i) => ({ ...p, position: i + 1 }))
        }

        // Only rotate the serving team
        if (state.servingTeam === 'team_a') {
          set({
            teamAPositions: rotatePositions(state.teamAPositions),
            servingTeam: 'team_b',
            undoStack: [...state.undoStack.slice(-19), undoState],
            matchLogs: [
              ...state.matchLogs,
              {
                id: uuidv4(),
                match_id: state.matchId || '',
                player_id: '',
                team_id: state.teamA?.id || '',
                action_type: 'rotation_change',
                position: 1,
                timestamp: new Date().toISOString(),
              },
            ],
          })
        } else {
          set({
            teamBPositions: rotatePositions(state.teamBPositions),
            servingTeam: 'team_a',
            undoStack: [...state.undoStack.slice(-19), undoState],
            matchLogs: [
              ...state.matchLogs,
              {
                id: uuidv4(),
                match_id: state.matchId || '',
                player_id: '',
                team_id: state.teamB?.id || '',
                action_type: 'rotation_change',
                position: 1,
                timestamp: new Date().toISOString(),
              },
            ],
          })
        }
      },

      setTeamPositions: (team, players) => {
        const state = get()
        const positions: CourtPosition[] = players.slice(0, 6).map((player, index) => ({
          position: index + 1,
          player,
          is_libero: player.is_libero,
        }))

        // Fill remaining positions
        while (positions.length < 6) {
          positions.push(createEmptyCourtPosition(positions.length + 1))
        }

        if (team === 'team_a') {
          set({ teamAPositions: positions })
        } else {
          set({ teamBPositions: positions })
        }
      },

      changeServer: () => {
        const state = get()
        set({ servingTeam: state.servingTeam === 'team_a' ? 'team_b' : 'team_a' })
      },

      recordStat: (playerId, actionType, position) => {
        const state = get()
        const undoState: GameState = JSON.parse(JSON.stringify(state))
        
        const teamKey = state.activeTeam === 'team_a' ? 'teamAStats' : 'teamBStats'
        const teamPositions = state.activeTeam === 'team_a' ? state.teamAPositions : state.teamBPositions
        
        const player = teamPositions.find(p => p.player?.id === playerId)?.player
        const teamId = state.activeTeam === 'team_a' ? state.teamA?.id : state.teamB?.id
        
        if (!player || !teamId) return

        const currentStats = state[teamKey][playerId] || createEmptyPlayerStats()
        
        const newStats = { ...currentStats }
        
        // Update stats based on action type
        switch (actionType) {
          case 'attack_kill':
            newStats.attacks += 1
            newStats.kills += 1
            break
          case 'attack_error':
            newStats.attacks += 1
            newStats.errors += 1
            break
          case 'attack_attempt':
            newStats.attacks += 1
            break
          case 'block_point':
            newStats.blocks += 1
            newStats.solo_blocks += 1
            break
          case 'block_error':
            newStats.blocks += 1
            newStats.errors += 1
            break
          case 'block_assist':
            newStats.blocks += 1
            newStats.block_assists += 1
            break
          case 'service_ace':
            newStats.aces += 1
            break
          case 'service_error':
            newStats.service_errors += 1
            break
          case 'reception_perfect':
            newStats.perfect_receptions += 1
            break
          case 'reception_good':
            newStats.good_receptions += 1
            break
          case 'reception_error':
            newStats.reception_errors += 1
            break
          case 'set_excellent':
            newStats.excellent_sets += 1
            newStats.assists += 1
            break
          case 'dig_excellent':
            newStats.excellent_digs += 1
            break
          case 'dig_good':
            newStats.good_digs += 1
            break
          case 'dig_error':
            newStats.dig_errors += 1
            break
        }

        newStats.id = currentStats.id || uuidv4()
        newStats.match_id = state.matchId || ''
        newStats.player_id = playerId
        newStats.team_id = teamId

        const newStatsRecord = { ...state[teamKey], [playerId]: newStats }

        set({
          [teamKey]: newStatsRecord,
          undoStack: [...state.undoStack.slice(-19), undoState],
          matchLogs: [
            ...state.matchLogs,
            {
              id: uuidv4(),
              match_id: state.matchId || '',
              player_id: playerId,
              team_id: teamId,
              action_type: actionType,
              position,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      },

      setActivePosition: (position, team) => {
        set({ activePosition: position, activeTeam: team })
      },

      toggleLibero: (position, team) => {
        const state = get()
        if (team === 'team_a') {
          const positions = [...state.teamAPositions]
          const pos = positions.find(p => p.position === position)
          if (pos && pos.player) {
            pos.is_libero = !pos.is_libero
            set({ teamAPositions: positions })
          }
        } else {
          const positions = [...state.teamBPositions]
          const pos = positions.find(p => p.position === position)
          if (pos && pos.player) {
            pos.is_libero = !pos.is_libero
            set({ teamBPositions: positions })
          }
        }
      },

      substitute: (fromPosition, toPosition, team) => {
        const state = get()
        if (team === 'team_a') {
          const positions = [...state.teamAPositions]
          const fromPlayer = positions.find(p => p.position === fromPosition)
          const toPlayer = positions.find(p => p.position === toPosition)
          if (fromPlayer && toPlayer) {
            const temp = fromPlayer.player
            fromPlayer.player = toPlayer.player
            toPlayer.player = temp
            set({ teamAPositions: positions })
          }
        } else {
          const positions = [...state.teamBPositions]
          const fromPlayer = positions.find(p => p.position === fromPosition)
          const toPlayer = positions.find(p => p.position === toPosition)
          if (fromPlayer && toPlayer) {
            const temp = fromPlayer.player
            fromPlayer.player = toPlayer.player
            toPlayer.player = temp
            set({ teamBPositions: positions })
          }
        }
      },

      getCurrentStats: (playerId) => {
        const state = get()
        return state.teamAStats[playerId] || state.teamBStats[playerId] || createEmptyPlayerStats()
      },

      getTeamStats: (team) => {
        const state = get()
        return team === 'team_a' ? state.teamAStats : state.teamBStats
      },

      getPerformanceLeaderboard: () => {
        const state = get()
        const allStats: { player: Player; score: number; team: Team }[] = []
        
        // Get team A stats
        Object.entries(state.teamAStats).forEach(([playerId, stats]) => {
          const player = state.teamAPositions.find(p => p.player?.id === playerId)?.player
          if (player && state.teamA) {
            allStats.push({
              player,
              score: computePerformanceScore(stats),
              team: state.teamA,
            })
          }
        })
        
        // Get team B stats
        Object.entries(state.teamBStats).forEach(([playerId, stats]) => {
          const player = state.teamBPositions.find(p => p.player?.id === playerId)?.player
          if (player && state.teamB) {
            allStats.push({
              player,
              score: computePerformanceScore(stats),
              team: state.teamB,
            })
          }
        })
        
        return allStats.sort((a, b) => b.score - a.score)
      },
    }),
    {
      name: 'sideout-game-storage',
    }
  )
)

export { computePerformanceScore }