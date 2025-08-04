import { Suspense } from "react";
import TopBar from "@/components/dashboard/TopBar";
import VoiceAssistantButton from "@/components/dashboard/VoiceAssistantButton";
import CriticalAlertsCard from "@/components/dashboard/CriticalAlertsCard";
import TodoListCard from "@/components/dashboard/TodoListCard";
import MarketSnapshotCard from "@/components/dashboard/MarketSnapshotCard";
import QuickLinksCard from "@/components/dashboard/QuickLinksCard";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Top Bar */}
      <Suspense fallback={<div className="h-16 bg-white shadow-sm animate-pulse"></div>}>
        <TopBar />
      </Suspense>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Critical Alerts - Highest Priority */}
            <Suspense fallback={<div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"></div>}>
              <CriticalAlertsCard />
            </Suspense>

            {/* Today's To-Do List */}
            <Suspense fallback={<div className="h-48 bg-white rounded-2xl shadow-sm animate-pulse"></div>}>
              <TodoListCard />
            </Suspense>
          </div>

          {/* Right Column - Secondary Cards */}
          <div className="space-y-6">
            {/* Market Snapshot */}
            <Suspense fallback={<div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"></div>}>
              <MarketSnapshotCard />
            </Suspense>

            {/* Quick Links */}
            <QuickLinksCard />
          </div>
        </div>
      </main>

      {/* Floating Voice Assistant Button */}
      <VoiceAssistantButton />
    </div>
  );
}
