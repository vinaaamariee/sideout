import { createClient } from "@supabase/supabase-js";
import type { MatchLogRow, MatchRow } from "@/types";

// ─── DATABASE TYPES ──────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      matches: {
        Row: MatchRow;
        Insert: Omit<MatchRow, "id" | "created_at">;
        Update: Partial<Omit<MatchRow, "id" | "created_at">>;
      };
      match_logs: {
        Row: MatchLogRow;
        Insert: Omit<MatchLogRow, "id" | "created_at">;
        Update: Partial<Omit<MatchLogRow, "id" | "created_at">>;
      };
    };
  };
};

// ─── CLIENT (browser) ────────────────────────────────────────────────────────
let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    }
  );
  return browserClient;
}

// ─── MATCH OPERATIONS ────────────────────────────────────────────────────────
export async function createMatch(
  matchId: string,
  homeTeamName: string,
  awayTeamName: string,
  gameState: object
) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("matches")
    .insert({
      id: matchId,
      home_team_name: homeTeamName,
      away_team_name: awayTeamName,
      home_sets: 0,
      away_sets: 0,
      status: "active",
      started_at: new Date().toISOString(),
      ended_at: null,
      game_state: gameState as MatchRow["game_state"],
    })
    .select()
    .single();

  if (error) console.error("createMatch error:", error);
  return { data, error };
}

export async function updateMatch(matchId: string, updates: Partial<MatchRow>) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", matchId);

  if (error) console.error("updateMatch error:", error);
  return { error };
}

// ─── LOG OPERATIONS ──────────────────────────────────────────────────────────
export async function insertLogEntry(entry: Omit<MatchLogRow, "id" | "created_at">) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("match_logs")
    .insert(entry)
    .select()
    .single();

  if (error) console.error("insertLogEntry error:", error);
  return { data, error };
}

export async function deleteLastLogEntry(matchId: string) {
  const supabase = getSupabaseBrowserClient();
  // Find the most recent entry for this match
  const { data: latest } = await supabase
    .from("match_logs")
    .select("id")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!latest) return { error: new Error("No entry to delete") };

  const { error } = await supabase
    .from("match_logs")
    .delete()
    .eq("id", latest.id);

  if (error) console.error("deleteLastLogEntry error:", error);
  return { error };
}

export async function getMatchLogs(matchId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("match_logs")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false });

  if (error) console.error("getMatchLogs error:", error);
  return { data: data ?? [], error };
}

export async function getMatch(matchId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error) console.error("getMatch error:", error);
  return { data, error };
}
