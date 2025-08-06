'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { 
  Home, 
  Settings, 
  MessageCircle, 
  BarChart3,
  User,
  Menu,
  X
} from "lucide-react";

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "হোম", href: "/" },
    { icon: Settings, label: "সেবা", href: "/services" },
    { icon: MessageCircle, label: "চ্যাট", href: "/chat" },
    { icon: BarChart3, label: "ড্যাশবোর্ড", href: "/dashboard" },
    { icon: User, label: "প্রোফাইল", href: "/profile" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-green-700 transition-colors duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Navigation Menu */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="md:hidden fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800">মেনু</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-green-50 transition-colors duration-200 text-slate-700 hover:text-green-700"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
};

export default MobileNavigation;
