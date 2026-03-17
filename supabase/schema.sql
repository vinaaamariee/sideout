-- SideOut: Real-Time Web-Based e-Scoresheet & Analytics System
-- Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'official' CHECK (role IN ('official', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  season TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLAYERS TABLE
-- ============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('OH', 'OP', 'MB', 'S', 'L', 'Unused')),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  is_libero BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_a_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  current_set INTEGER DEFAULT 1,
  set_scores JSONB DEFAULT '[{"team_a": 0, "team_b": 0}, {"team_a": 0, "team_b": 0}, {"team_a": 0, "team_b": 0}, {"team_a": 0, "team_b": 0}, {"team_a": 0, "team_b": 0}]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  winner TEXT,
  match_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MATCH LINEUPS TABLE (Starting lineups)
-- ============================================
CREATE TABLE match_lineups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3, 4, 5, 6)),
  is_starting BOOLEAN DEFAULT TRUE,
  is_libero BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, team_id, position)
);

-- ============================================
-- MATCH LOGS TABLE (Play-by-play)
-- ============================================
CREATE TABLE match_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  position INTEGER CHECK (position IN (1, 2, 3, 4, 5, 6)),
  points_earned INTEGER DEFAULT 0,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PLAYER STATS TABLE (Aggregated per match)
-- ============================================
CREATE TABLE player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  -- Attack stats
  attacks INTEGER DEFAULT 0,
  kills INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  -- Block stats
  blocks INTEGER DEFAULT 0,
  solo_blocks INTEGER DEFAULT 0,
  block_assists INTEGER DEFAULT 0,
  -- Service stats
  aces INTEGER DEFAULT 0,
  service_errors INTEGER DEFAULT 0,
  -- Setter stats
  assists INTEGER DEFAULT 0,
  excellent_sets INTEGER DEFAULT 0,
  -- Reception stats
  perfect_receptions INTEGER DEFAULT 0,
  good_receptions INTEGER DEFAULT 0,
  reception_errors INTEGER DEFAULT 0,
  -- Dig stats
  excellent_digs INTEGER DEFAULT 0,
  good_digs INTEGER DEFAULT 0,
  dig_errors INTEGER DEFAULT 0,
  -- Computed
  performance_score NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, player_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_match_logs_match ON match_logs(match_id);
CREATE INDEX idx_player_stats_match ON player_stats(match_id);
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX idx_teams_created_by ON teams(created_by);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles: Users can update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teams: Everyone can view, officials can create/update
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Officials can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Officials can update teams" ON teams FOR UPDATE USING (auth.uid() = created_by);

-- Players: Everyone can view, team owners can manage
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Officials can create players" ON players FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teams WHERE id = players.team_id AND created_by = auth.uid())
);
CREATE POLICY "Officials can update players" ON players FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teams WHERE id = players.team_id AND created_by = auth.uid())
);

-- Matches: Officials can manage their matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Officials can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Officials can update matches" ON matches FOR UPDATE USING (auth.uid() = created_by);

-- Match Lineups: Same as matches
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lineups" ON match_lineups FOR SELECT USING (true);
CREATE POLICY "Officials can manage lineups" ON match_lineups FOR ALL USING (
  EXISTS (SELECT 1 FROM matches m 
    JOIN teams t ON m.team_a_id = t.id OR m.team_b_id = t.id 
    WHERE m.id = match_lineups.match_id AND t.created_by = auth.uid())
);

-- Match Logs: Everyone can view, officials can create
ALTER TABLE match_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view logs" ON match_logs FOR SELECT USING (true);
CREATE POLICY "Realtime can read logs" ON match_logs FOR SELECT USING (true);
CREATE POLICY "Officials can create logs" ON match_logs FOR INSERT WITH CHECK (true);

-- Player Stats: Everyone can view, officials can manage
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stats" ON player_stats FOR SELECT USING (true);
CREATE POLICY "Officials can manage stats" ON player_stats FOR ALL USING (true);

-- ============================================
-- REALTIME CONFIGURATION
-- ============================================

-- Enable realtime for match_logs
ALTER PUBLICATION supabase_realtime ADD TABLE match_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STORAGE BUCKETS (Run these as SQL commands)
-- ============================================

-- Storage buckets will be created via Supabase Storage UI or API
-- Expected buckets:
-- 1. team-logos - for team logo uploads
-- 2. player-photos - for player photo uploads

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for match with team details
CREATE OR REPLACE VIEW matches_with_teams AS
SELECT 
  m.*,
  ta.name AS team_a_name,
  ta.logo_url AS team_a_logo,
  ta.color AS team_a_color,
  tb.name AS team_b_name,
  tb.logo_url AS team_b_logo,
  tb.color AS team_b_color
FROM matches m
LEFT JOIN teams ta ON m.team_a_id = ta.id
LEFT JOIN teams tb ON m.team_b_id = tb.id;

-- View for player stats with player details
CREATE OR REPLACE VIEW player_stats_with_details AS
SELECT 
  ps.*,
  p.name AS player_name,
  p.jersey_number,
  p.position AS player_position,
  p.photo_url AS player_photo,
  t.name AS team_name
FROM player_stats ps
LEFT JOIN players p ON ps.player_id = p.id
LEFT JOIN teams t ON ps.team_id = t.id;

-- View for computing Player of the Game
CREATE OR REPLACE VIEW player_of_game_candidates AS
SELECT 
  ps.match_id,
  ps.player_id,
  p.name AS player_name,
  p.jersey_number,
  p.position AS player_position,
  p.photo_url AS player_photo,
  t.name AS team_name,
  t.logo_url AS team_logo,
  ps.kills,
  ps.blocks,
  ps.solo_blocks,
  ps.block_assists,
  ps.aces,
  ps.assists,
  ps.excellent_sets,
  ps.excellent_digs,
  ps.errors,
  ps.service_errors,
  ps.reception_errors,
  ps.dig_errors,
  (
    (ps.kills * 1.0) +
    (ps.blocks * 1.5) +
    (ps.solo_blocks * 1.5) +
    (ps.block_assists * 1.0) +
    (ps.aces * 1.2) +
    (ps.assists * 0.5) +
    (ps.excellent_sets * 0.5) +
    (ps.excellent_digs * 1.0) -
    ps.errors -
    ps.service_errors -
    ps.reception_errors -
    ps.dig_errors
  ) AS performance_score
FROM player_stats ps
JOIN players p ON ps.player_id = p.id
JOIN teams t ON ps.team_id = t.id;
