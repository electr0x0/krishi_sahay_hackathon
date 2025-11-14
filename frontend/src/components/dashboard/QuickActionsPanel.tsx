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
    gradient: 'from-blue-500 to-cyan-500',
    link: '/dashboard/chat',
  },
  {
    id: '2',
    title: 'ভয়েস এজেন্ট',
    description: 'কথা বলে সহায়তা নিন',
    icon: Mic,
    gradient: 'from-purple-500 to-pink-500',
    link: '/dashboard/voice-chat',
    badge: '3D',
  },
  {
    id: '3',
    title: 'রোগ সনাক্তকরণ',
    description: 'গাছের রোগ চিহ্নিত করুন',
    icon: Camera,
    gradient: 'from-green-500 to-emerald-500',
    link: '/dashboard/detection',
    badge: 'AI',
  },
  {
    id: '4',
    title: 'বাজার মূল্য',
    description: 'আজকের দাম দেখুন',
    icon: TrendingUp,
    gradient: 'from-orange-500 to-red-500',
    link: '/dashboard/market',
  },
  {
    id: '5',
    title: 'অনলাইন স্টোর',
    description: 'কৃষি পণ্য কিনুন',
    icon: ShoppingCart,
    gradient: 'from-indigo-500 to-purple-500',
    link: '/dashboard/store',
  },
  {
    id: '6',
    title: 'কমিউনিটি',
    description: 'কৃষকদের সাথে যুক্ত হন',
    icon: Users,
    gradient: 'from-teal-500 to-cyan-500',
    link: '/dashboard/community',
  },
];

export default function QuickActionsPanel() {
  const router = useRouter();

  return (
    <div className="relative bg-white/70 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden rounded-3xl">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
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
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 hover:border-gray-300 shadow-md hover:shadow-xl transition-all duration-200 h-full">
                  {/* Icon with gradient background */}
                  <div className="relative mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Badge */}
                    {action.badge && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
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

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform -skew-x-12" 
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      animation: 'shine 2s infinite'
                    }} 
                  />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200"
        >
          আরও দেখুন →
        </motion.button>
      </div>

      {/* Shine animation keyframes */}
      <style jsx global>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
      `}</style>
    </div>
  );
}

