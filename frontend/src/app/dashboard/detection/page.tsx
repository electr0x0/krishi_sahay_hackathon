'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, Camera, History, Settings, Sparkles, Leaf, ScanLine, CheckCircle2, XCircle } from 'lucide-react';
import Cookies from 'js-cookie';

// Import our new components
import ImageDetection from '@/components/dashboard/detection/ImageDetection';
import VideoDetection from '@/components/dashboard/detection/VideoDetection';
import CameraDetection from '@/components/dashboard/detection/CameraDetection';
import DetectionHistory from '@/components/dashboard/detection/DetectionHistory';

type DetectionMode = 'image' | 'video' | 'camera' | 'history';

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

const DetectionPage = () => {
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('image');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);

  // Auth headers helper
  const getAuthHeaders = () => {
    const token = Cookies.get('auth_token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  };

  const modeConfig = {
    image: {
      title: 'ছবি সনাক্তকরণ',
      icon: Upload,
      description: 'একটি ছবি আপলোড করে রোগ সনাক্ত করুন',
      component: ImageDetection
    },
    video: {
      title: 'ভিডিও সনাক্তকরণ',
      icon: Video,
      description: 'ভিডিও ফাইল প্রক্রিয়াকরণ করে রোগ সনাক্ত করুন',
      component: VideoDetection
    },
    camera: {
      title: 'ক্যামেরা সনাক্তকরণ',
      icon: Camera,
      description: 'লাইভ ক্যামেরা ব্যবহার করে রিয়েল-টাইম সনাক্তকরণ',
      component: CameraDetection
    },
    history: {
      title: 'সনাক্তকরণের ইতিহাস',
      icon: History,
      description: 'পূর্বের সকল সনাক্তকরণের রেকর্ড দেখুন',
      component: DetectionHistory
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gray-50"></div>

      <div className="relative z-10 p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Enhanced Header */}
          <motion.div
            variants={cardVariants}
            className="text-center space-y-4 relative"
          >
            {/* Icon Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-3xl shadow-lg mb-4"
            >
              <Leaf className="w-10 h-10 text-white" />
            </motion.div>

            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                উদ্ভিদের রোগ সনাক্তকরণ
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                🤖 <span className="font-semibold">AI-চালিত</span> প্রযুক্তি ব্যবহার করে উদ্ভিদের রোগ দ্রুত ও নির্ভুলভাবে সনাক্ত করুন
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-6 pt-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-white backdrop-blur-sm px-4 py-2 rounded-xl border border-green-200 shadow-md"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">নির্ভুলতা</p>
                  <p className="text-sm font-bold text-gray-800">৯৫%+</p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-white backdrop-blur-sm px-4 py-2 rounded-xl border border-blue-200 shadow-md"
              >
                <ScanLine className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">সনাক্তকরণ</p>
                  <p className="text-sm font-bold text-gray-800">৫০+ রোগ</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-white backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-md"
              >
                <Sparkles className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">সময়</p>
                  <p className="text-sm font-bold text-gray-800">&lt;2 সেকেন্ড</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Mode Selection */}
          <motion.div
            variants={cardVariants}
            transition={{ delay: 0.1 }}
            className="relative bg-white border-l-4 border-green-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl"
          >
            <div className="relative z-10 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ScanLine className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">সনাক্তকরণের পদ্ধতি</h2>
                    <p className="text-xs text-gray-600">আপনার পছন্দের পদ্ধতি বেছে নিন</p>
                  </div>
                </div>
                
                {/* Confidence Threshold Setting */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 shadow-sm"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      নির্ভুলতা:
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      className="w-24 accent-green-600"
                    />
                    <span className="text-sm font-bold text-green-600 min-w-[3rem] text-center bg-green-50 px-2 py-1 rounded-lg">
                      {Math.round(confidenceThreshold * 100)}%
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(modeConfig).map(([mode, config], index) => {
                  const Icon = config.icon;
                  const isActive = detectionMode === mode;
                  
                  const colors = {
                    image: { bg: 'bg-blue-600', border: 'border-blue-600', icon: 'bg-blue-600' },
                    video: { bg: 'bg-green-600', border: 'border-green-600', icon: 'bg-green-600' },
                    camera: { bg: 'bg-green-600', border: 'border-green-600', icon: 'bg-green-600' },
                    history: { bg: 'bg-blue-600', border: 'border-blue-600', icon: 'bg-blue-600' },
                  };
                  
                  const modeColor = colors[mode as keyof typeof colors];
                  
                  return (
                    <motion.button
                      key={mode}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDetectionMode(mode as DetectionMode)}
                      className="relative group"
                    >
                      <div className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left h-full ${
                        isActive
                          ? `border-transparent ${modeColor.bg} text-white shadow-lg`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}>
                        {/* Icon */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isActive 
                              ? 'bg-white/20' 
                              : modeColor.icon
                          } shadow-md`}>
                            <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white'}`} />
                          </div>
                          
                          {/* Active Indicator */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-3 h-3 bg-white rounded-full shadow-lg"
                              />
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Text */}
                        <h3 className={`font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {config.title}
                        </h3>
                        <p className={`text-sm ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                          {config.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Main Content with Enhanced Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={detectionMode}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {detectionMode === 'image' && (
                <ImageDetection
                  confidenceThreshold={confidenceThreshold}
                  getAuthHeaders={getAuthHeaders}
                />
              )}
              {detectionMode === 'video' && (
                <VideoDetection
                  confidenceThreshold={confidenceThreshold}
                  getAuthHeaders={getAuthHeaders}
                />
              )}
              {detectionMode === 'camera' && (
                <CameraDetection
                  confidenceThreshold={confidenceThreshold}
                  getAuthHeaders={getAuthHeaders}
                />
              )}
              {detectionMode === 'history' && (
                <DetectionHistory
                  getAuthHeaders={getAuthHeaders}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DetectionPage;
