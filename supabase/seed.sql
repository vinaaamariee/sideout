-- Seed Data for SideOut (VolleyTrack)

-- 1. Create Teams
INSERT INTO teams (name, color, season)
VALUES 
  ('Batanes Sharks', '#0047AB', 'Season 2026'),
  ('Iraya Spikers', '#FF4500', 'Season 2026');

-- 2. Create Players (Batanes Sharks)
-- Using a subquery to get the team ID
DO $$
DECLARE
    sharks_id UUID := (SELECT id FROM teams WHERE name = 'Batanes Sharks' LIMIT 1);
    iraya_id UUID := (SELECT id FROM teams WHERE name = 'Iraya Spikers' LIMIT 1);
BEGIN
    -- Sharks Players
    INSERT INTO players (name, jersey_number, position, team_id, is_libero) VALUES
    ('Juan Dela Cruz', 7, 'S', sharks_id, FALSE),
    ('Maria Santos', 10, 'OH', sharks_id, FALSE),
    ('Pedro Penduko', 3, 'MB', sharks_id, FALSE),
    ('Elena Adarna', 1, 'L', sharks_id, TRUE),
    ('Ricardo Dalisay', 22, 'OP', sharks_id, FALSE);

    -- Iraya Spikers Players
    INSERT INTO players (name, jersey_number, position, team_id, is_libero) VALUES
    ('Kardo Probinsyano', 5, 'OH', iraya_id, FALSE),
    ('Liza Soberano', 8, 'MB', iraya_id, FALSE),
    ('Enrique Gil', 12, 'S', iraya_id, FALSE),
    ('Vina Morales', 4, 'L', iraya_id, TRUE);

    -- 3. Create a Sample Match
    INSERT INTO matches (team_a_id, team_b_id, status, current_set)
    VALUES (sharks_id, iraya_id, 'in_progress', 1);
END $$;