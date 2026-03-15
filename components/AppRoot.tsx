"use client";

import { useState } from "react";
import { useAuthStore, canEditMatch } from "@/store/useAuthStore";
import { useGameStore } from "@/store/useGameStore";
import WelcomeScreen from "@/components/WelcomeScreen";
import LoginScreen from "@/components/LoginScreen";
import TeamSetupScreen from "@/components/TeamSetupScreen";
import MatchClient from "@/components/MatchClient";

type AppStep = "welcome" | "login" | "app";

export default function AppRoot() {
    const role = useAuthStore((s) => s.role);
    const enterAsViewer = useAuthStore((s) => s.enterAsViewer);
    const homePlayers = useGameStore((s) => s.game.teams.home.players);
    const awayPlayers = useGameStore((s) => s.game.teams.away.players);

    // Track which screen to show before auth
    const [appStep, setAppStep] = useState<AppStep>(role ? "app" : "welcome");
    // Track whether setup has been explicitly completed this session
    const [setupDone, setSetupDone] = useState(false);

    // If user is already logged in, show app
    if (role && appStep !== "app") {
        setAppStep("app");
    }

    // Welcome screen
    if (!role && appStep === "welcome") {
        return (
            <WelcomeScreen
                onOfficialClick={() => setAppStep("login")}
                onViewerClick={() => {
                    enterAsViewer();
                    setAppStep("app");
                }}
            />
        );
    }

    // Login/Signup screen
    if (!role && appStep === "login") {
        return <LoginScreen onBack={() => setAppStep("welcome")} />;
    }

    // Not logged in yet, show welcome
    if (!role) {
        return (
            <WelcomeScreen
                onOfficialClick={() => setAppStep("login")}
                onViewerClick={() => {
                    enterAsViewer();
                    setAppStep("app");
                }}
            />
        );
    }

    // Officials see setup screen if no players have been added yet
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
