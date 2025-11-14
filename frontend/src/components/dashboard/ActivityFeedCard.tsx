'use client';

import { motion } from 'framer-motion';
import { Activity, Droplet, Sprout, AlertTriangle, TrendingUp, Calendar, Check } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'harvest' | 'alert' | 'growth' | 'task';
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
  bgColor: string;
}

const activities: ActivityItem[] = [
  {
    id: '1',
    type: 'irrigation',
    title: 'সেচ সম্পন্ন',
    description: 'ধানের জমিতে সেচ দেওয়া হয়েছে',
    time: '২ ঘন্টা আগে',
    icon: Droplet,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: '2',
    type: 'fertilizer',
    title: 'সার প্রয়োগ',
    description: 'টমেটো চাষে ইউরিয়া সার দেওয়া হয়েছে',
    time: '৫ ঘন্টা আগে',
    icon: Sprout,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: '3',
    type: 'alert',
    title: 'সতর্কতা',
    description: 'আগামীকাল বৃষ্টির সম্ভাবনা - সেচ স্থগিত করুন',
    time: '৮ ঘন্টা আগে',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: '4',
    type: 'growth',
    title: 'ফসলের বৃদ্ধি',
    description: 'ধান গাছ ৮০% বৃদ্ধি পেয়েছে',
    time: '১ দিন আগে',
    icon: TrendingUp,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: '5',
    type: 'task',
    title: 'কাজ সম্পন্ন',
    description: 'আগাছা পরিষ্কার করার কাজ সম্পন্ন হয়েছে',
    time: '২ দিন আগে',
    icon: Check,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
];

export default function ActivityFeedCard() {
  return (
    <div className="relative bg-white border-l-4 border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md"
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">সাম্প্রতিক কার্যক্রম</h3>
              <p className="text-xs text-gray-500">আজকের সকল কার্যক্রম</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            সব দেখুন →
          </motion.button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="relative"
              >
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                  {/* Icon */}
                  <div className={`w-10 h-10 ${activity.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-800 truncate">
                        {activity.title}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                </div>

                {/* Connector line (except for last item) */}
                {index < activities.length - 1 && (
                  <div className="absolute left-9 top-[60px] w-0.5 h-4 bg-gray-200" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  );
}

