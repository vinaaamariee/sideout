import { Suspense } from "react";
import AppRoot from "@/components/AppRoot";

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-court-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏐</div>
          <div className="text-2xl font-black tracking-widest text-white">
            SIDE<span className="text-sky-400">OUT</span>
          </div>
          <div className="text-slate-500 text-sm mt-2 tracking-wider">Loading match engine...</div>
        </div>
      </div>
    }>
      <AppRoot />
    </Suspense>
  );
}
