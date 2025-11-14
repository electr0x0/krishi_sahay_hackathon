'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart2, Bell, Camera, ClipboardPlus, Home, LayoutDashboard, LogOut, MessageSquare, Mic, ShoppingBag, User, Users, Leaf, Sparkles } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext.jsx';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const sidebarVariants = {
  open: {
    width: '280px',
    transition: {
      type: 'spring',
      stiffness: 20,
      restDelta: 2,
    },
  },
  closed: {
    width: '80px',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const navItemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { href: '/dashboard/detection', label: 'রোগ শনাক্তকরণ', icon: Camera },
    { href: '/dashboard/analytics', label: 'বিশ্লেষণ', icon: BarChart2 },
    { href: '/dashboard/chat', label: 'চ্যাট', icon: MessageSquare },
    { href: '/dashboard/voice-chat', label: 'AI এর সাথে কথা বলুন', icon: Mic },
    { href: '/dashboard/iot', label: 'IoT', icon: Activity },
    { href: '/dashboard/community', label: 'সম্প্রদায়', icon: Users },
    { href: '/dashboard/store', label: 'আমার দোকান', icon: ShoppingBag },
    { href: '/dashboard/notifications', label: 'নোটিফিকেশন', icon: Bell },
    { href: '/dashboard/report/comprehensive', label: 'আমার খামার', icon: ClipboardPlus },
    { href: '/dashboard/profile', label: 'প্রোফাইল', icon: User },
  ];

  const bottomNavItems = [
    { href: '/', label: 'হোম', icon: Home },
  ];

  return (
    <motion.div
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      className="bg-white/80 backdrop-blur-xl border-r border-green-200/50 flex flex-col h-screen shadow-xl relative overflow-hidden"
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 via-transparent to-emerald-50/50 pointer-events-none" />
      
      {/* Header with logo */}
      <div className="flex items-center justify-between p-4 border-b border-green-200/50 relative z-10">
        <motion.div
          animate={isOpen ? 'open' : 'closed'}
          variants={navItemVariants}
          className="flex items-center space-x-2"
        >
          {isOpen && (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                কৃষি সহায়
              </span>
            </>
          )}
          {!isOpen && (
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
          )}
        </motion.div>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-green-100 transition-colors group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-600 group-hover:text-green-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
        {navItems.map((item, index) => (
          <Link href={item.href} key={item.href}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'group relative flex items-center p-3 rounded-xl transition-all duration-200',
                pathname === item.href
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'text-gray-700 hover:bg-green-50/80 hover:text-green-600'
              )}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              {/* Active indicator */}
              {pathname === item.href && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className="relative z-10 flex items-center w-full">
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  pathname === item.href && "drop-shadow-lg"
                )} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Hover glow effect */}
              {pathname !== item.href && (
                <div className="absolute inset-0 rounded-xl bg-green-400/0 group-hover:bg-green-400/10 transition-colors duration-200" />
              )}
            </motion.div>
          </Link>
        ))}
      </nav>

      {/* Footer section */}
      <div className="px-3 py-4 border-t border-green-200/50 space-y-2 relative z-10">
        {bottomNavItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <motion.div
              className={cn(
                'flex items-center p-3 rounded-xl text-gray-700 hover:bg-green-50/80 hover:text-green-600 transition-all duration-200',
                pathname === item.href && 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
              )}
              whileHover={{ x: 5 }}
            >
              <item.icon className="w-5 h-5" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        ))}
        
        {/* User profile card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 shadow-sm"
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 flex-1 min-w-0 overflow-hidden"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {isOpen && (
                <motion.button
                  onClick={() => logout()}
                  className="ml-2 p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;