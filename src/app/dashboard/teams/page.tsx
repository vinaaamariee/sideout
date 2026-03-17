'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { supabase } from '@/lib/supabase'
import { uploadImage, validateImageFile, STORAGE_BUCKETS } from '@/lib/storage'
import type { Team, Player, PlayerPosition } from '@/types'

const POSITIONS: PlayerPosition[] = ['OH', 'OP', 'MB', 'S', 'L', 'Unused']

export default function TeamsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()

  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTeam, setShowNewTeam] = useState(false)
  const [showNewPlayer, setShowNewPlayer] = useState(false)
  const [saving, setSaving] = useState(false)

  // Team form state
  const [teamName, setTeamName] = useState('')
  const [teamColor, setTeamColor] = useState('#3B82F6')
  const [teamSeason, setTeamSeason] = useState('')
  const [teamLogo, setTeamLogo] = useState<File | null>(null)

  // Player form state
  const [playerName, setPlayerName] = useState('')
  const [playerJersey, setPlayerJersey] = useState('')
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>('OH')
  const [playerIsLibero, setPlayerIsLibero] = useState(false)
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam.id)
    }
  }, [selectedTeam])

  const fetchTeams = async () => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')
      
      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlayers = async (teamId: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('jersey_number')
      
      if (error) throw error
      setPlayers(data || [])
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return
    if (!supabase) {
      console.error('Supabase client not initialized')
      setSaving(false)
      return
    }

    setSaving(true)
    try {
      let logoUrl: string | null = null

      // Upload logo if provided
      if (teamLogo) {
        const teamId = crypto.randomUUID()
        const result = await uploadImage(teamLogo, 'team-logo', teamId)
        if (result.success && result.url) {
          logoUrl = result.url
        }
      }

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          color: teamColor,
          season: teamSeason,
          logo_url: logoUrl,
        })
        .select()
        .single()

      if (error) throw error

      setTeams([...teams, data])
      setShowNewTeam(false)
      resetTeamForm()
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreatePlayer = async () => {
    if (!selectedTeam || !playerName.trim() || !playerJersey) return
    if (!supabase) {
      console.error('Supabase client not initialized')
      setSaving(false)
      return
    }

    setSaving(true)
    try {
      let photoUrl: string | null = null

      // Upload photo if provided
      if (playerPhoto) {
        const playerId = crypto.randomUUID()
        const result = await uploadImage(playerPhoto, 'player-photo', playerId)
        if (result.success && result.url) {
          photoUrl = result.url
        }
      }

      const { data, error } = await supabase
        .from('players')
        .insert({
          name: playerName,
          jersey_number: parseInt(playerJersey),
          position: playerPosition,
          team_id: selectedTeam.id,
          photo_url: photoUrl,
          is_libero: playerIsLibero,
        })
        .select()
        .single()

      if (error) throw error

      setPlayers([...players, data])
      setShowNewPlayer(false)
      resetPlayerForm()
    } catch (error) {
      console.error('Error creating player:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? All players will also be deleted.')) return
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error

      setTeams(teams.filter(t => t.id !== teamId))
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null)
        setPlayers([])
      }
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return
    if (!supabase) {
      console.error('Supabase client not initialized')
      return
    }

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId)

      if (error) throw error

      setPlayers(players.filter(p => p.id !== playerId))
    } catch (error) {
      console.error('Error deleting player:', error)
    }
  }

  const resetTeamForm = () => {
    setTeamName('')
    setTeamColor('#3B82F6')
    setTeamSeason('')
    setTeamLogo(null)
  }

  const resetPlayerForm = () => {
    setPlayerName('')
    setPlayerJersey('')
    setPlayerPosition('OH')
    setPlayerIsLibero(false)
    setPlayerPhoto(null)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Team Management
              </h1>
            </div>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Teams
                </h2>
                <button
                  onClick={() => setShowNewTeam(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                >
                  + New Team
                </button>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              ) : teams.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No teams yet. Create your first team!
                </p>
              ) : (
                <div className="space-y-2">
                  {teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: team.color }}>
                          <span className="text-white font-bold">{team.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                        {team.season && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{team.season}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTeam(team.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Players List */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    {selectedTeam.logo_url ? (
                      <img src={selectedTeam.logo_url} alt={selectedTeam.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedTeam.color }}>
                        <span className="text-xl font-bold text-white">{selectedTeam.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedTeam.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {players.length} players
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewPlayer(true)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                  >
                    + Add Player
                  </button>
                </div>

                {players.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No players yet. Add players to this team!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {players.map(player => (
                      <div
                        key={player.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-4"
                      >
                        {player.photo_url ? (
                          <img src={player.photo_url} alt={player.name} className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {player.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            #{player.jersey_number} • {player.position} {player.is_libero && '(Libero)'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a team to view its players
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Team Modal */}
      {showNewTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Team
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Season
                </label>
                <input
                  type="text"
                  value={teamSeason}
                  onChange={(e) => setTeamSeason(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="e.g., Spring 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Color
                </label>
                <input
                  type="color"
                  value={teamColor}
                  onChange={(e) => setTeamColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setTeamLogo(e.target.files[0])}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowNewTeam(false); resetTeamForm() }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                disabled={saving || !teamName.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Player Modal */}
      {showNewPlayer && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add Player to {selectedTeam.name}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player Name *
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Enter player name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jersey Number *
                </label>
                <input
                  type="number"
                  value={playerJersey}
                  onChange={(e) => setPlayerJersey(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="e.g., 10"
                  min="0"
                  max="99"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  value={playerPosition}
                  onChange={(e) => setPlayerPosition(e.target.value as PlayerPosition)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLibero"
                  checked={playerIsLibero}
                  onChange={(e) => setPlayerIsLibero(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isLibero" className="text-sm text-gray-700 dark:text-gray-300">
                  Libero
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Player Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setPlayerPhoto(e.target.files[0])}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowNewPlayer(false); resetPlayerForm() }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlayer}
                disabled={saving || !playerName.trim() || !playerJersey}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
