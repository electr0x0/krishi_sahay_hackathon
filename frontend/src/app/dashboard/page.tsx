'use client'

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";

import CriticalAlertsCard from "@/components/dashboard/CriticalAlertsCard";
import TodoListCard from "@/components/dashboard/TodoListCard";
import MarketSnapshotCard from "@/components/dashboard/MarketSnapshotCard";
import QuickLinksCard from "@/components/dashboard/QuickLinksCard";
import SmartWeatherCard from "@/components/dashboard/SmartWeatherCard";
import CropManagementCard from "@/components/dashboard/CropManagementCard";
import VoiceAssistantButton from "@/components/dashboard/VoiceAssistantButton";
import { Pointer } from "@/components/magicui/pointer";
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import MyDataPage from "./notifications/page";

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
    <div className="relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* Welcome Section */}
        <motion.div 
          variants={cardVariants}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            স্বাগতম, আপনার কৃষি ড্যাশবোর্ডে
          </h1>
          <p className="text-gray-600 text-sm">
            আপনার ফসল ও কৃষি কার্যক্রম পরিচালনা করুন একটি স্থান থেকেই
          </p>
        </motion.div>

        {/* Critical Alerts - Top Priority */}
        <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
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
            {/* Market Snapshot */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <Suspense fallback={<LoadingCard height="h-32" />}>
                <MarketSnapshotCard />
              </Suspense>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <QuickLinksCard />
            </motion.div>

            {/* Quick Stats Card */}
            {/* <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <div className="bg-white/95 backdrop-blur-sm border-0 shadow-lg rounded-xl p-4">
                <h3 className="text-base font-bold text-gray-800 mb-3">দ্রুত পরিসংখ্যান</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">মোট জমি</span>
                    <span className="font-bold text-green-600 text-sm">৪.৫ শতক</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">সক্রিয় ফসল</span>
                    <span className="font-bold text-blue-600 text-sm">৩টি</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">আজকের কাজ</span>
                    <span className="font-bold text-orange-600 text-sm">৫টি</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">এই মাসের আয়</span>
                    <span className="font-bold text-green-600 text-sm">৳২৫,০০০</span>
                  </div>
                </div>
              </div>
            </motion.div> */}
           <div className="w-full"><MyDataPage></MyDataPage></div>

            {/* Tips Card */}
            <motion.div variants={cardVariants} transition={{ duration: 0.5, ease: "easeOut" }}>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-xl p-4">
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  আজকের পরামর্শ
                </h3>
                <div className="space-y-2">
                  <div className="bg-white/80 p-2 rounded-lg">
                    <p className="text-xs text-gray-700">
                      আবহাওয়া ভাল থাকলে আজ ধানের জমিতে সার দিন।
                    </p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-lg">
                    <p className="text-xs text-gray-700">
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
       <Pointer className="fill-green-500" />
    </div>
  );
}
