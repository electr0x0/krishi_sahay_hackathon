'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, Camera, History, Settings } from 'lucide-react';
import Cookies from 'js-cookie';

// Import our new components
import ImageDetection from '@/components/dashboard/detection/ImageDetection';
import VideoDetection from '@/components/dashboard/detection/VideoDetection';
import CameraDetection from '@/components/dashboard/detection/CameraDetection';
import DetectionHistory from '@/components/dashboard/detection/DetectionHistory';

type DetectionMode = 'image' | 'video' | 'camera' | 'history';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const DetectionPage = () => {
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('image');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);

  // Auth headers helper
  const getAuthHeaders = () => {
    const token = Cookies.get('access_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
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

  const CurrentComponent = modeConfig[detectionMode].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            উদ্ভিদের রোগ সনাক্তকরণ
          </h1>
          <p className="text-lg text-gray-600">
            কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে উদ্ভিদের রোগ দ্রুত ও নির্ভুলভাবে সনাক্ত করুন
          </p>
        </motion.div>

        {/* Mode Selection */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">সনাক্তকরণের পদ্ধতি নির্বাচন করুন</h2>
            
            {/* Confidence Threshold Setting */}
            <div className="flex items-center space-x-4">
              <Settings className="w-5 h-5 text-gray-500" />
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  আত্মবিশ্বাসের সীমা:
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 min-w-12">
                  {Math.round(confidenceThreshold * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(modeConfig).map(([mode, config]) => {
              const Icon = config.icon;
              const isActive = detectionMode === mode;
              
              return (
                <button
                  key={mode}
                  onClick={() => setDetectionMode(mode as DetectionMode)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <h3 className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {config.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {config.description}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          key={detectionMode}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ delay: 0.2 }}
        >
          <CurrentComponent
            confidenceThreshold={confidenceThreshold}
            getAuthHeaders={getAuthHeaders}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DetectionPage;
