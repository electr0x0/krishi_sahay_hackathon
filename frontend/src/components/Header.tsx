'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
// import { useTheme } from "@/providers/ThemeProvider";

// User Profile Dropdown Component
const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Mock user data - replace with actual user context
  const user = {
    name: "রহিম মিয়া",
    avatar: "👨‍🌾",
    isLoggedIn: true
  };

  const handleLogout = () => {
    // Logout logic would go here
    console.log("Logging out...");
    setIsDropdownOpen(false);
  };

  if (!user.isLoggedIn) {
    return (
      <Link href="/auth/login">
        <InteractiveHoverButton text="লগইন" />
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-black/10 transition-colors duration-200"
        title={user.name}
      >
        <div className="w-8 h-8 bg-green-100/90 rounded-full flex items-center justify-center text-lg">
          {user.avatar}
        </div>
        <svg className="w-4 h-4 text-gray-700 drop-shadow" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">কৃষক</p>
          </div>
          
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            প্রোফাইল
          </Link>
          
          <Link
            href="/my-farm"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            আমার খামার
          </Link>
          
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            সেটিংস
          </Link>
          
          <hr className="my-2" />
          
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            লগআউট
          </button>
        </div>
      )}
    </div>
  );
};
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Theme toggle logic would go here
  };

  return (
    <label className="grid cursor-pointer place-items-center mr-4">
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleTheme}
        className="toggle theme-controller bg-green-600 col-span-2 col-start-1 row-start-1 opacity-0 w-12 h-6"
      />
      <div className="w-12 h-6 bg-gray-300 rounded-full relative transition-colors duration-300 col-start-1 row-start-1">
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
      </div>
      {/* Sun Icon */}
      <svg
        className={`w-4 h-4 col-start-1 row-start-1 ml-1 transition-opacity duration-300 ${isDarkMode ? 'opacity-30' : 'opacity-100'}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      {/* Moon Icon */}
      <svg
        className={`w-4 h-4 col-start-1 row-start-1 mr-1 transition-opacity duration-300 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </label>
  );
};
const InteractiveHoverButton = ({ text, className = "", onClick }: { 
  text: string; 
  className?: string; 
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-2.5 font-semibold text-white rounded-lg 
        bg-gradient-to-r from-green-500 to-emerald-600 
        hover:from-green-600 hover:to-emerald-700
        transform transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg active:scale-95
        ${className}
      `}
    >
      <span className="relative z-10">{text}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
    </button>
  );
};

// Hamburger Menu Component
const HamburgerMenu = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  return (
    <button
      onClick={toggle}
      className="md:hidden w-8 h-8 flex flex-col justify-center items-center space-y-1 group"
      aria-label="Toggle menu"
    >
      <span className={`w-6 h-0.5 bg-gray-800 drop-shadow transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
      <span className={`w-6 h-0.5 bg-gray-800 drop-shadow transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
      <span className={`w-6 h-0.5 bg-gray-800 drop-shadow transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
    </button>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const activeClassName = "font-semibold text-gray-800 drop-shadow-lg border-b-2 border-green-500 transition-all duration-300";
  const inactiveClassName = "font-medium text-gray-700 drop-shadow border-b-2 border-transparent transition-all duration-300 hover:text-gray-800 hover:border-green-500";

  const navigationLinks = [
    { href: "/", label: "হোম" },
    { href: "/dashboard", label: "ড্যাশবোর্ড" },
    { href: "/market", label: "বাজার" },
    { href: "/my-farm", label: "আমার খামার" },
    { href: "/assistant", label: "AI সহায়ক", badge: "NEW" }
  ];

  const NavLink = ({ href, label, badge, mobile = false }: { href: string; label: string; badge?: string; mobile?: boolean }) => (
    <Link
      href={href}
      onClick={() => mobile && setIsMenuOpen(false)}
      className={`
        px-3 py-2 relative group flex items-center space-x-1
        ${isActive(href) ? activeClassName : inactiveClassName}
        ${mobile ? 'w-full' : 'inline-flex'}
      `}
    >
      <span>{label}</span>
      {badge && (
        <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-green-500 drop-shadow transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out w-11/12 mx-auto" />
    </Link>
  );

  return (
    <nav className="bg-transparent  sticky top-0 z-50 border-b border-black/10">
      <div className="container mx-auto px-8 ">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16">
          
          {/* Navbar Start - Logo & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <HamburgerMenu isOpen={isMenuOpen} toggle={() => setIsMenuOpen(!isMenuOpen)} />
            </div>
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="rounded-full overflow-hidden group-hover:scale-105 transition-all duration-300">
                <Image src="https://i.postimg.cc/Hk4B0n8r/landscaping-logo-white-background-1277164-20458.avif" alt="Logo" width={32} height={32} className="rounded-full" />
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-2xl text-gray-800 drop-shadow-lg group-hover:text-green-700 transition-colors duration-300">কৃষি</span>
                <span className="font-bold text-2xl text-green-600 drop-shadow-lg ml-1 group-hover:text-green-700 transition-colors duration-300">সহায়</span>
              </div>
            </Link>
          </div>

          {/* Navbar Center - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} badge={link.badge} />
            ))}
          </div>

          {/* Navbar End - Theme Toggle, User Profile & CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <UserProfile />
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/85 backdrop-blur-md shadow-lg border-b border-black/20 z-40">
            <div className="px-4 py-4 space-y-2 animate-fade-in">
              {navigationLinks.map((link) => (
                <div key={link.href} className="py-1">
                  <NavLink href={link.href} label={link.label} badge={link.badge} mobile={true} />
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ডার্ক মোড</span>
                  <ThemeToggle />
                </div>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <InteractiveHoverButton text="শুরু করুন" className="w-full" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
