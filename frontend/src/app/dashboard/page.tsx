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
        {/* Welcome Section with Bangladesh theme */}
        <motion.div 
          variants={cardVariants}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 overflow-hidden shadow-2xl"
        >
          {/* Bangladesh flag inspired pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-700/20 rounded-full blur-3xl" />
          
          {/* Rice paddy pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0c-5.523 0-10 4.477-10 10v10h20V10c0-5.523-4.477-10-10-10zm0 40c5.523 0 10-4.477 10-10V20H10v10c0 5.523 4.477 10 10 10z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
          }} />
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  স্বাগতম, আপনার কৃষি ড্যাশবোর্ডে
                </h1>
                <p className="text-green-50 text-sm mt-1">
                  আপনার ফসল ও কৃষি কার্যক্রম পরিচালনা করুন একটি স্থান থেকেই 🌾
                </p>
              </div>
            </motion.div>
            
            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40">
                🌤️ আবহাওয়া দেখুন
              </button>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40">
                📊 বিশ্লেষণ
              </button>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40">
                🤖 AI সহায়তা
              </button>
            </motion.div>
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

        {/* Critical Alerts - Top Priority with glow effect */}
        <motion.div 
          variants={cardVariants} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(239, 68, 68, 0.3)',
                '0 0 40px rgba(239, 68, 68, 0.5)',
                '0 0 20px rgba(239, 68, 68, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="rounded-2xl"
          >
            <Suspense fallback={<LoadingCard height="h-32" />}>
              <CriticalAlertsCard />
            </Suspense>
          </motion.div>
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
