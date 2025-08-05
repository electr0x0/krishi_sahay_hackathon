'use client'

import { Suspense } from "react";
import { motion } from "framer-motion";
import CriticalAlertsCard from "@/components/dashboard/CriticalAlertsCard";
import TodoListCard from "@/components/dashboard/TodoListCard";
import MarketSnapshotCard from "@/components/dashboard/MarketSnapshotCard";
import QuickLinksCard from "@/components/dashboard/QuickLinksCard";
import SmartWeatherCard from "@/components/dashboard/SmartWeatherCard";
import CropManagementCard from "@/components/dashboard/CropManagementCard";
import VoiceAssistantButton from "@/components/dashboard/VoiceAssistantButton";

const LoadingCard = ({ height = "h-32" }: { height?: string }) => (
  <div className={`${height} bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm animate-pulse border border-gray-100`}>
    <div className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/2 animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded-full w-2/3 animate-pulse"></div>
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
    <div className="relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div 
          variants={cardVariants}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            স্বাগতম, আপনার কৃষি ড্যাশবোর্ডে
          </h1>
          <p className="text-gray-600">
            আপনার ফসল ও কৃষি কার্যক্রম পরিচালনা করুন একটি স্থান থেকেই
          </p>
        </motion.div>

        {/* Critical Alerts - Top Priority */}
        <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
          <Suspense fallback={<LoadingCard height="h-48" />}>
            <CriticalAlertsCard />
          </Suspense>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Primary Cards */}
          <div className="xl:col-span-8 space-y-6">
            {/* Weather Card */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-96" />}>
                <SmartWeatherCard />
              </Suspense>
            </motion.div>

            {/* Crop Management */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-96" />}>
                <CropManagementCard />
              </Suspense>
            </motion.div>

            {/* Today's To-Do List */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-64" />}>
                <TodoListCard />
              </Suspense>
            </motion.div>
          </div>

          {/* Right Column - Secondary Cards */}
          <div className="xl:col-span-4 space-y-6">
            {/* Market Snapshot */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-48" />}>
                <MarketSnapshotCard />
              </Suspense>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <QuickLinksCard />
            </motion.div>

            {/* Quick Stats Card */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <div className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">দ্রুত পরিসংখ্যান</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">মোট জমি</span>
                    <span className="font-bold text-green-600">৪.৫ শতক</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">সক্রিয় ফসল</span>
                    <span className="font-bold text-blue-600">৩টি</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">আজকের কাজ</span>
                    <span className="font-bold text-orange-600">৫টি</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">এই মাসের আয়</span>
                    <span className="font-bold text-green-600">৳২৫,০০০</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  আজকের পরামর্শ
                </h3>
                <div className="space-y-3">
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      আবহাওয়া ভাল থাকলে আজ ধানের জমিতে সার দিন।
                    </p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      টমেটোর গাছে নিয়মিত পানি দিতে ভুলবেন না।
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <VoiceAssistantButton />
    </div>
  );
}
