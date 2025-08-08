'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart2, Bell, MessageSquare, Settings, LifeBuoy, User, LogOut, Home, ClipboardPlus } from 'lucide-react';

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
    { href: '/dashboard/community', label: 'সম্প্রদায়', icon: Users },
    { href: '/dashboard/store', label: 'আমার দোকান', icon: BarChart2 },
    { href: '/dashboard/notifications', label: 'নোটিফিকেশন', icon: Bell },
    { href: '/dashboard/chat', label: 'চ্যাট', icon: MessageSquare },
    { href: '/dashboard/voice-chat', label: 'AI এর সাথে কথা বলুন', icon: Mic },
    { href: '/dashboard/profile', label: 'প্রোফাইল', icon: User },
    { href: '/dashboard/settings', label: 'সেটিংস', icon: Settings },
    { href: '/dashboard/report', label: 'কৃষি রিপোর্ট', icon: ClipboardPlus },
  ];

  const bottomNavItems = [
    { href: '/', label: 'হোম', icon: Home },
    { href: '/dashboard/help', label: 'সহায়তা', icon: LifeBuoy },
  ];

  return (
    <motion.div
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
      className="bg-white border-r border-gray-200 flex flex-col h-screen"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <motion.div
          animate={isOpen ? 'open' : 'closed'}
          variants={navItemVariants}
        >
          {isOpen && <span className="text-lg font-bold text-gray-900">কৃষি সহায়</span>}
        </motion.div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <motion.div
              className={cn(
                'flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors',
                pathname === item.href && 'bg-green-100 text-green-700'
              )}
            >
              <item.icon className="w-6 h-6" />
              <motion.span
                animate={isOpen ? 'open' : 'closed'}
                variants={navItemVariants}
                className={cn('ml-4 font-medium', !isOpen && 'hidden')}
              >
                {item.label}
              </motion.span>
            </motion.div>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-gray-200">
        {bottomNavItems.map((item) => (
           <Link href={item.href} key={item.href}>
           <motion.div
             className={cn(
               'flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors',
               pathname === item.href && 'bg-green-100 text-green-700'
             )}
           >
             <item.icon className="w-6 h-6" />
             <motion.span
               animate={isOpen ? 'open' : 'closed'}
               variants={navItemVariants}
               className={cn('ml-4 font-medium', !isOpen && 'hidden')}
             >
               {item.label}
             </motion.span>
           </motion.div>
         </Link>
        ))}
        {user && (
          <div className="flex items-center mt-4 p-2 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <motion.div
              animate={isOpen ? 'open' : 'closed'}
              variants={navItemVariants}
              className={cn('ml-3', !isOpen && 'hidden')}
            >
              <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </motion.div>
            <motion.button 
              onClick={() => logout()} 
              className={cn('ml-auto p-2 rounded-lg hover:bg-red-100 text-red-500', !isOpen && 'hidden')}
              title="লগআউট"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
      
    </motion.div>
  );
};

export default Sidebar;