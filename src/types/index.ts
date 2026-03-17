// Team types
export interface Team {
  id: string
  name: string
  logo_url: string | null
  color: string
  season: string
  created_at: string
}

// Player types
export type PlayerPosition = 'OH' | 'OP' | 'MB' | 'S' | 'L' | 'Unused'

export interface Player {
  id: string
  name: string
  jersey_number: number
  position: PlayerPosition
  team_id: string
  photo_url: string | null
  is_libero: boolean
  created_at: string
}

// Match types
export type MatchStatus = 'pending' | 'in_progress' | 'completed'
export type SetWinner = 'team_a' | 'team_b' | null

export interface Match {
  id: string
  team_a_id: string
  team_b_id: string
  team_a_score: number
  team_b_score: number
  current_set: number
  status: MatchStatus
  winner: string | null
  match_date: string
  created_at: string
  team_a?: Team
  team_b?: Team
}

// Match Log types
export type ActionType = 
  | 'attack_kill'
  | 'attack_error'
  | 'attack_attempt'
  | 'block_point'
  | 'block_error'
  | 'block_assist'
  | 'service_ace'
  | 'service_error'
  | 'reception_perfect'
  | 'reception_good'
  | 'reception_error'
  | 'set_excellent'
  | 'set_good'
  | 'dig_excellent'
  | 'dig_good'
  | 'dig_error'
  | 'score_change'
  | 'rotation_change'
  | 'substitution'
  | 'libero_change'

export interface MatchLogEntry {
  id: string
  match_id: string
  player_id: string
  team_id: string
  action_type: ActionType
  position: number
  timestamp: string
  player?: Player
  team?: Team
}

// Player Stats types
export interface PlayerStats {
  id: string
  match_id: string
  player_id: string
  team_id: string
  // Spiker stats
  attacks: number
  kills: number
  errors: number
  blocks: number
  solo_blocks: number
  block_assists: number
  // Service stats
  aces: number
  service_errors: number
  // Setter stats
  assists: number
  excellent_sets: number
  // Reception stats
  perfect_receptions: number
  good_receptions: number
  reception_errors: number
  // Dig stats
  excellent_digs: number
  good_digs: number
  dig_errors: number
}

// Court position state
export interface CourtPosition {
  position: number // 1-6
  player: Player | null
  is_libero: boolean
}

// Game state
export interface GameState {
  // Match info
  matchId: string | null
  teamA: Team | null
  teamB: Team | null
  
  // Score
  teamAScore: number
  teamBScore: number
  currentSet: number
  servingTeam: 'team_a' | 'team_b'
  
  // Rotation (6 positions each side)
  teamAPositions: CourtPosition[]
  teamBPositions: CourtPosition[]
  
  // Stats
  teamAStats: Record<string, PlayerStats>
  teamBStats: Record<string, PlayerStats>
  
  // Logs
  matchLogs: MatchLogEntry[]
  
  // Undo stack
  undoStack: GameState[]
  
  // Active player for stat entry
  activePosition: number
  activeTeam: 'team_a' | 'team_b'
}

// Analytics types
export interface PlayerAnalytics {
  player: Player
  stats: PlayerStats
  hittingPercentage: number
  receptionEfficiency: number
  performanceScore: number
}

export interface TeamAnalytics {
  team: Team
  totalKills: number
  totalErrors: number
  totalAttempts: number
  hittingPercentage: number
  totalAces: number
  totalBlocks: number
  playerAnalytics: PlayerAnalytics[]
}

// PDF Report types
export interface MatchReportData {
  match: Match
  teamA: Team
  teamB: Team
  setScores: { teamA: number; teamB: number }[]
  playerStats: { player: Player; stats: PlayerStats; team: Team }[]
  playerOfGame: PlayerAnalytics
}