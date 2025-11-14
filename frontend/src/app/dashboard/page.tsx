'use client'

import { Suspense } from "react";
import { motion } from "framer-motion";
import { Sprout, TrendingUp, DollarSign, Calendar, AlertCircle, Sparkles } from "lucide-react";
import CriticalAlertsCard from "@/components/dashboard/CriticalAlertsCard";
import TodoListCard from "@/components/dashboard/TodoListCard";
import MarketSnapshotCard from "@/components/dashboard/MarketSnapshotCard";
import QuickLinksCard from "@/components/dashboard/QuickLinksCard";
import SmartWeatherCard from "@/components/dashboard/SmartWeatherCard";
import CropManagementCard from "@/components/dashboard/CropManagementCard";
import VoiceAssistantButton from "@/components/dashboard/VoiceAssistantButton";
import AnimatedStatsCard from "@/components/dashboard/AnimatedStatsCard";
import ActivityFeedCard from "@/components/dashboard/ActivityFeedCard";
import PerformanceChartCard from "@/components/dashboard/PerformanceChartCard";
import QuickActionsPanel from "@/components/dashboard/QuickActionsPanel";

const LoadingCard = ({ height = "h-24" }: { height?: string }) => (
  <div className={`${height} bg-white/50 backdrop-blur-sm rounded-xl shadow-sm animate-pulse border border-gray-100`}>
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
      <div className="h-2 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
      <div className="h-2 bg-gray-200 rounded-full w-2/3 animate-pulse"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Section - Clean Professional Design */}
        <motion.div 
          variants={cardVariants}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white border-l-4 border-green-600 rounded-2xl p-8 shadow-lg relative overflow-hidden"
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316a34a' fill-opacity='1'%3E%3Cpath d='M30 0c-5.523 0-10 4.477-10 10v10h20V10c0-5.523-4.477-10-10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  স্বাগতম, আপনার কৃষি ড্যাশবোর্ডে
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  আপনার ফসল ও কৃষি কার্যক্রম পরিচালনা করুন একটি স্থান থেকেই 🌾
                </p>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors duration-200 border border-blue-200">
                🌤️ আবহাওয়া
              </button>
              <button className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 border border-green-200">
                📊 বিশ্লেষণ
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm">
                🤖 AI সহায়তা
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Animated Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <AnimatedStatsCard
            title="মোট জমি"
            value={4.5}
            unit="বিঘা"
            icon={Sprout}
            color="green"
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <AnimatedStatsCard
            title="সক্রিয় ফসল"
            value={3}
            unit="প্রকার"
            icon={Calendar}
            color="blue"
            trend={{ value: 8, isPositive: true }}
            delay={0.1}
          />
          <AnimatedStatsCard
            title="এই মাসের আয়"
            value="২৫,০০০"
            unit="৳"
            icon={TrendingUp}
            color="orange"
            trend={{ value: 15, isPositive: true }}
            delay={0.2}
          />
          <AnimatedStatsCard
            title="সতর্কতা"
            value={2}
            unit="টি"
            icon={AlertCircle}
            color="red"
            delay={0.3}
          />
        </div>

        {/* Critical Alerts */}
        <motion.div 
          variants={cardVariants} 
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Suspense fallback={<LoadingCard height="h-32" />}>
            <CriticalAlertsCard />
          </Suspense>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left Column - Primary Cards */}
          <div className="xl:col-span-8 space-y-4">
            {/* Weather Card */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-64" />}>
                <SmartWeatherCard />
              </Suspense>
            </motion.div>

            {/* Crop Management */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-64" />}>
                <CropManagementCard />
              </Suspense>
            </motion.div>

            {/* Today's To-Do List */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-48" />}>
                <TodoListCard />
              </Suspense>
            </motion.div>
          </div>

          {/* Right Column - Secondary Cards */}
          <div className="xl:col-span-4 space-y-4">
            {/* Quick Actions Panel */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <QuickActionsPanel />
            </motion.div>

            {/* Market Snapshot */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-32" />}>
                <MarketSnapshotCard />
              </Suspense>
            </motion.div>

            {/* Activity Feed */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <ActivityFeedCard />
            </motion.div>
          </div>
        </div>

        {/* Performance Chart - Full Width */}
        <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
          <PerformanceChartCard />
        </motion.div>
      </motion.div>
      <VoiceAssistantButton />
    </div>
  );
}
