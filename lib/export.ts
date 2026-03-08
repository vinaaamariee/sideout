import type { GameState, Team, TeamKey, PlayerWithMeta } from "@/types";
import {
  calcHittingPct, calcReceptionEfficiency, calcPogScore, calcTeamStats,
} from "./game-logic";

export async function exportMatchPDF(
  state: GameState,
  allPlayers: PlayerWithMeta[]
): Promise<void> {
  // Dynamically import jsPDF to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { teams, log, currentSet, startedAt } = state;

  const homeTeam = teams.home;
  const awayTeam = teams.away;
  const homeSets = homeTeam.sets.reduce((a, b) => a + (b > 0 ? 1 : 0), 0);
  const awaySets = awayTeam.sets.reduce((a, b) => a + (b > 0 ? 1 : 0), 0);
  const winner = homeSets > awaySets ? homeTeam.name : awayTeam.name;
  const pogWinner = allPlayers[0];

  // ── HEADER ──
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("VOLLEYTRACK PRO", 105, 14, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Official Match Report", 105, 22, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Date: ${new Date(startedAt).toLocaleDateString()}   |   Duration: ${currentSet + 1} sets`, 105, 30, { align: "center" });

  // ── SCORE SUMMARY ──
  doc.setFillColor(15, 22, 41);
  doc.rect(0, 40, 210, 28, "F");
  doc.setTextColor(14, 165, 233);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(homeTeam.name, 40, 58, { align: "center" });
  doc.setTextColor(244, 63, 94);
  doc.text(awayTeam.name, 170, 58, { align: "center" });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.text(`${homeSets}`, 85, 60, { align: "center" });
  doc.text(`${awaySets}`, 125, 60, { align: "center" });
  doc.setFontSize(24);
  doc.setTextColor(100, 116, 139);
  doc.text("–", 105, 60, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`WINNER: ${winner}`, 105, 64, { align: "center" });

  let y = 75;

  // ── PLAYER OF THE GAME ──
  doc.setFillColor(120, 53, 15);
  doc.rect(14, y, 182, 22, "F");
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PLAYER OF THE GAME", 105, y + 7, { align: "center" });
  doc.setFontSize(14);
  doc.text(`#${pogWinner.number} ${pogWinner.name}  —  ${pogWinner.role}  (${pogWinner.teamName})`, 105, y + 16, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(180, 120, 50);
  doc.text(`PoG Score: ${calcPogScore(pogWinner.stats).toFixed(1)}`, 105, y + 21, { align: "center" });

  y += 28;

  // ── PLAYER STATS TABLES ──
  for (const teamKey of ["home", "away"] as TeamKey[]) {
    const team = teams[teamKey];
    const ts = calcTeamStats(team);

    doc.setTextColor(teamKey === "home" ? 14 : 244, teamKey === "home" ? 165 : 63, teamKey === "home" ? 233 : 94);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${team.name} TEAM STATS`, 14, y + 7);
    y += 10;

    autoTable(doc, {
      startY: y,
      head: [["#", "Player", "Role", "K", "E", "TA", "Hit%", "BLK", "ACE", "AST", "DIG", "Rec+", "Rec-", "PoG"]],
      body: [
        ...team.players.map((p) => [
          `#${p.number}`,
          p.name,
          p.role,
          p.stats.kills,
          p.stats.attackErrors,
          p.stats.totalAttempts,
          calcHittingPct(p.stats),
          p.stats.blocks,
          p.stats.aces,
          p.stats.assists,
          p.stats.excDigs,
          p.stats.receptions.perfect + p.stats.receptions.good,
          p.stats.receptions.error,
          calcPogScore(p.stats).toFixed(1),
        ]),
        // Team totals row
        ["", "TOTALS", "", ts.kills, ts.attackErrors, ts.totalAttempts,
          ts.totalAttempts > 0 ? `${(((ts.kills - ts.attackErrors) / ts.totalAttempts) * 100).toFixed(1)}%` : "—",
          ts.blocks, ts.aces, ts.assists, ts.excDigs,
          ts.recPerfect + ts.recGood, ts.recError, ""],
      ],
      styles: { fontSize: 8, cellPadding: 2, textColor: [30, 30, 30] },
      headStyles: { fillColor: [15, 22, 41], textColor: [148, 163, 184], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      rowPageBreak: "avoid",
      theme: "striped",
    });

    // @ts-ignore
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── PLAY-BY-PLAY LOG (last 50) ──
  if (y > 220) { doc.addPage(); y = 20; }

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PLAY-BY-PLAY LOG (Last 50 Actions)", 14, y + 7);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Set", "Time", "Team", "Player", "Action", "Score"]],
    body: log.slice(0, 50).map((e) => [
      `S${e.set}`, e.timestamp.split("T")[1]?.slice(0, 8) ?? e.timestamp,
      e.teamName, `#${e.playerNumber} ${e.playerName}`,
      e.action.replace(/([A-Z])/g, " $1").trim(),
      `${e.homeScore}–${e.awayScore}`,
    ]),
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [15, 22, 41], textColor: [148, 163, 184] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    theme: "striped",
  });

  // ── FOOTER ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`VolleyTrack Pro  |  Page ${i} of ${pageCount}  |  Generated ${new Date().toLocaleString()}`, 105, 290, { align: "center" });
  }

  doc.save(`match-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ─── CSV EXPORT ──────────────────────────────────────────────────────────────
export function exportMatchCSV(state: GameState): void {
  const { log, teams } = state;

  const rows = [
    ["Set", "Timestamp", "Team", "Player #", "Player Name", "Action", "Home Score", "Away Score"],
    ...log.map((e) => [
      e.set,
      e.timestamp,
      e.teamName,
      e.playerNumber,
      e.playerName,
      e.action,
      e.homeScore,
      e.awayScore,
    ]),
  ];

  const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `volley-match-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
