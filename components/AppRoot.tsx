"use client";

import { useAuthStore } from "@/store/useAuthStore";
import LoginScreen from "@/components/LoginScreen";
import MatchClient from "@/components/MatchClient";

export default function AppRoot() {
    const role = useAuthStore((s) => s.role);

    if (!role) {
        return <LoginScreen />;
    }

    return <MatchClient />;
}
