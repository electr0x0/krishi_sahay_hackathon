'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Camera, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  FileText,
  Zap,
  Mic
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  link: string;
  badge?: string;
}

const actions: QuickAction[] = [
  {
    id: '1',
    title: 'AI চ্যাট',
    description: 'কৃষি বিশেষজ্ঞের পরামর্শ',
    icon: MessageSquare,
    gradient: 'bg-blue-600',
    link: '/dashboard/chat',
  },
  {
    id: '2',
    title: 'ভয়েস এজেন্ট',
    description: 'কথা বলে সহায়তা নিন',
    icon: Mic,
    gradient: 'bg-purple-600',
    link: '/dashboard/voice-chat',
    badge: '3D',
  },
  {
    id: '3',
    title: 'রোগ সনাক্তকরণ',
    description: 'গাছের রোগ চিহ্নিত করুন',
    icon: Camera,
    gradient: 'bg-green-600',
    link: '/dashboard/detection',
    badge: 'AI',
  },
  {
    id: '4',
    title: 'বাজার মূল্য',
    description: 'আজকের দাম দেখুন',
    icon: TrendingUp,
    gradient: 'bg-orange-600',
    link: '/dashboard/market',
  },
  {
    id: '5',
    title: 'অনলাইন স্টোর',
    description: 'কৃষি পণ্য কিনুন',
    icon: ShoppingCart,
    gradient: 'bg-green-600',
    link: '/dashboard/store',
  },
  {
    id: '6',
    title: 'কমিউনিটি',
    description: 'কৃষকদের সাথে যুক্ত হন',
    icon: Users,
    gradient: 'bg-blue-600',
    link: '/dashboard/community',
  },
];

export default function QuickActionsPanel() {
  const router = useRouter();

  return (
    <div className="relative bg-white border-l-4 border-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl">

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div
            className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-md"
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">দ্রুত কার্যক্রম</h3>
            <p className="text-xs text-gray-500">এক ক্লিকে শুরু করুন</p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(action.link)}
                className="relative group"
              >
                <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 h-full">
                  {/* Icon */}
                  <div className="relative mb-3">
                    <div className={`w-12 h-12 ${action.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Badge */}
                    {action.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        className="absolute -top-1 -right-1 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
                      >
                        {action.badge}
                      </motion.div>
                    )}
                  </div>

                  {/* Content */}
                  <h4 className="text-sm font-semibold text-gray-800 mb-1 group-hover:text-gray-900">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          আরও দেখুন →
        </motion.button>
      </div>
    </div>
  );
}

