"use client";

import type { Team, Player } from "@/types";
import { ROLE_COLORS, BACK_ROW_POSITIONS } from "@/types";

interface CourtGridProps {
  team: Team;
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  onLiberoSwap: (positionIndex: number) => void;
}

// Court positions visual layout (row-major, top = net)
// Visual: [4, 3, 2] (front row, left to right = pos 4, 3, 2)
//         [5, 6, 1] (back row,  left to right = pos 5, 6, 1)
// Array indices 0-5 = [pos1, pos2, pos3, pos4, pos5, pos6]
const LAYOUT = [
  { label: "4", idx: 3 },  // front-left
  { label: "3", idx: 2 },  // front-middle
  { label: "2", idx: 1 },  // front-right
  { label: "5", idx: 4 },  // back-left
  { label: "6", idx: 5 },  // back-middle
  { label: "1", idx: 0 },  // back-right (server)
];

export default function CourtGrid({
  team,
  selectedPlayerId,
  onSelectPlayer,
  onLiberoSwap,
}: CourtGridProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
          Court — {team.name}
        </div>
        <div className="text-[10px] text-slate-600 font-bold tracking-wider">
          ← NET
        </div>
      </div>

      {/* Net line */}
      <div className="border-t-2 border-dashed border-sky-500/30 mb-1 relative">
        <span className="absolute right-0 -top-2.5 text-[9px] text-sky-500/50 font-bold">NET</span>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto mt-3">
        {LAYOUT.map(({ label, idx }) => {
          const pid = team.rotation[idx];
          const player = team.players.find((p) => p.id === pid);
          const isLibero = player?.role === "L";
          const isSelected = pid === selectedPlayerId;
          const isBackRow = BACK_ROW_POSITIONS.includes(idx);

          return (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="text-[9px] text-slate-600 font-black tracking-widest">P{label}</div>

              <CourtCell
                player={player ?? null}
                teamColor={team.color}
                isSelected={isSelected}
                isLibero={isLibero}
                onClick={() => player && onSelectPlayer(player.id)}
              />

              {isBackRow && (
                <button
                  onClick={() => onLiberoSwap(idx)}
                  className="text-[9px] font-black text-amber-500/70 hover:text-amber-400
                             bg-amber-500/10 hover:bg-amber-500/20 rounded px-2 py-0.5
                             transition-all duration-150 tracking-wider w-full text-center"
                >
                  L ↔
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 border-t border-slate-700/30 pt-2 text-[10px] text-slate-600 text-center font-bold tracking-wider">
        BACK ROW
      </div>
    </div>
  );
}

function CourtCell({
  player,
  teamColor,
  isSelected,
  isLibero,
  onClick,
}: {
  player: Player | null;
  teamColor: string;
  isSelected: boolean;
  isLibero: boolean;
  onClick: () => void;
}) {
  const roleColor = player ? ROLE_COLORS[player.role] : "#334155";
  const borderColor = isSelected ? "#ffffff" : isLibero ? "#f59e0b" : "rgba(255,255,255,0.08)";
  const bgColor = isSelected
    ? `${teamColor}25`
    : isLibero
    ? "rgba(120,53,15,0.25)"
    : "#0f1629";

  return (
    <div
      className="court-cell w-[80px] h-[80px]"
      style={{
        background: bgColor,
        borderColor,
        boxShadow: isSelected ? `0 0 18px ${teamColor}30` : undefined,
      }}
      onClick={onClick}
    >
      {player ? (
        <>
          <div
            className="text-xl font-black leading-none"
            style={{ color: isLibero ? "#f59e0b" : teamColor }}
          >
            #{player.number}
          </div>
          <div className="text-[11px] text-slate-400 font-bold mt-0.5 leading-none">
            {player.name}
          </div>
          <div
            className="text-[9px] font-black mt-1 tracking-wider px-1.5 py-0.5 rounded"
            style={{ color: roleColor, background: `${roleColor}18` }}
          >
            {player.role}
          </div>
        </>
      ) : (
        <div className="text-slate-700 text-xl font-black">—</div>
      )}
    </div>
  );
}
