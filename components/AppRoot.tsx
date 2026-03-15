"use client";

import { useState } from "react";
import { useAuthStore, canEditMatch } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";
import LoginScreen from "@/components/LoginScreen";
import TeamSetupScreen from "@/components/TeamSetupScreen";
import MatchClient from "@/components/MatchClient";

export default function AppRoot() {
    const role = useAuthStore((s) => s.role);
    const homePlayers = useGameStore((s) => s.game.teams.home.players);
    const awayPlayers = useGameStore((s) => s.game.teams.away.players);

    // Track whether setup has been explicitly completed this session
    const [setupDone, setSetupDone] = useState(false);

    if (!role) {
        return <LoginScreen />;
    }

    // Coaching staff / referee see setup screen if no players have been added yet
    // and setup hasn't been completed this session
    const needsSetup =
        canEditMatch(role) &&
        !setupDone &&
        homePlayers.length === 0 &&
        awayPlayers.length === 0;

    if (needsSetup) {
        return <TeamSetupScreen onStart={() => setSetupDone(true)} />;
    }

    return <MatchClient />;
}
