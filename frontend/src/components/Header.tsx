'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Settings, Menu, X, Sprout, ChevronDown, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import AuthModal from "@/components/auth/AuthModal.js";
import MobileNavigation from "@/components/navigation/MobileNavigation";

// Interactive Button Component
const InteractiveHoverButton = ({ text, href, onClick, variant = "primary" }: {
  text: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) => {
  const baseClasses = "relative overflow-hidden font-medium py-2 px-6 rounded-full transition-all duration-300 hover:shadow-lg transform hover:scale-105";
  const variantClasses = variant === "primary" 
    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
    : "border-2 border-green-500 text-green-600 hover:bg-green-50";

  const button = (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="relative z-10">{text}</span>
    </motion.button>
  );

  return href ? <Link href={href}>{button}</Link> : button;
};

// User Profile Dropdown Component
const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const authContext = useAuth() as { user: { full_name?: string; email?: string } | null; isAuthenticated: boolean; logout?: () => void };
  const { user, isAuthenticated } = authContext;
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    try {
      // Use the logout function from context
      if (authContext.logout && typeof authContext.logout === 'function') {
        authContext.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsDropdownOpen(false);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-2">
        <InteractiveHoverButton 
          text="লগইন" 
          variant="secondary"
          onClick={() => openAuthModal('login')}
        />
        <InteractiveHoverButton 
          text="নিবন্ধন" 
          onClick={() => openAuthModal('register')}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  // Cast user to appropriate type to avoid TypeScript issues
  const userInfo = user as { full_name?: string; email?: string };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-black/10 transition-colors duration-200"
        title={userInfo?.full_name || "User"}
      >
        <div className="w-8 h-8 bg-green-100/90 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-green-600" />
        </div>
        <span className="hidden md:block text-sm font-medium">{userInfo?.full_name?.split(' ')[0] || 'User'}</span>
        <ChevronDown className="w-4 h-4 text-gray-700" />
      </button>

      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userInfo?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500">{userInfo?.email || ''}</p>
          </div>
          
          <Link href="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            ড্যাশবোর্ড
          </Link>
          
          <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 transition-colors">
            <Settings className="w-4 h-4 mr-2" />
            সেটিংস
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            লগআউট
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Main Header Component
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    { href: "/", label: "হোম" },
    { href: "/services", label: "সেবা" },
    { href: "/how-it-works", label: "কীভাবে কাজ করে" },
    { href: "/#impact", label: "প্রভাব" },
    ...(isAuthenticated ? [
      { href: "/chat", label: "চ্যাট" },
    ] : []),
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-green-100"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">কৃষি সহায়</span>
                <span className="text-xs text-gray-500 leading-none">স্মার্ট কৃষি প্ল্যাটফর্ম</span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <motion.div key={index} whileHover={{ y: -2 }}>
                <Link
                  href={item.href}
                  className={`text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                    pathname === item.href ? 'text-green-600' : ''
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            {isAuthenticated && (
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  href="/dashboard"
                  className={`flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                    pathname.startsWith('/dashboard') ? 'text-green-600' : ''
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  ড্যাশবোর্ড
                </Link>
              </motion.div>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <UserProfile />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4 border-t border-green-100">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`block text-gray-700 hover:text-green-600 font-medium transition-colors ${
                  pathname === item.href ? 'text-green-600' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
               <Link
               href="/dashboard"
               className={`flex items-center text-gray-700 hover:text-green-600 font-medium transition-colors duration-200 ${
                 pathname.startsWith('/dashboard') ? 'text-green-600' : ''
               }`}
             >
               <LayoutDashboard className="w-4 h-4 mr-2" />
               ড্যাশবোর্ড
             </Link>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="mt-4">
                <UserProfile />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </motion.header>
  );
};

export default Header;