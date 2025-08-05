'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, Users, Award, TrendingUp, Mic } from "lucide-react";

export default function HeroSection() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: "10,000+", label: language === 'bn' ? 'কৃষক' : 'Farmers', icon: Users },
    { number: "64", label: language === 'bn' ? 'জেলায় সেবা' : 'Districts', icon: Award },
    { number: "35%", label: language === 'bn' ? 'ফসলের ক্ষতি কমান' : 'Crop Loss Reduction', icon: TrendingUp }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.8,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://i.postimg.cc/Ss4ZcqjS/jochen-van-wylick-m-5-TPI3d-Hc-Y-unsplash.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Floating Elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-10 text-6xl opacity-20"
      >
        🌾
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-32 right-20 text-5xl opacity-20"
        style={{ animationDelay: '2s' }}
      >
        🚜
      </motion.div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute bottom-32 left-20 text-4xl opacity-20"
        style={{ animationDelay: '4s' }}
      >
        🌱
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          
          {/* Language Toggle */}
          <motion.div 
            className="mb-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-all duration-300 border border-white/30"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </motion.div>

          {/* Logo/Brand */}
          <motion.div 
            className="mb-8"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold mb-2">
              <span className="text-green-400 drop-shadow-lg">কৃষি সহায়</span> 
              <span className="text-white drop-shadow-lg ml-2">AI</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-400 mx-auto rounded-full"></div>
          </motion.div>

          {/* Enhanced Headline */}
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-8 leading-tight"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <span className="text-green-400 drop-shadow-2xl">
              {language === 'bn' ? 'স্মার্ট' : 'Smart'}
            </span>{' '}
            <span className="text-white drop-shadow-2xl">
              {language === 'bn' ? 'কৃষির' : 'Farming'}
            </span>
            <br />
            <span className="text-white drop-shadow-2xl text-3xl sm:text-4xl lg:text-6xl font-normal">
              {language === 'bn' ? 'নতুন যুগ' : 'New Era'}
            </span>
          </motion.h1>
          
          {/* Enhanced Sub-headline */}
          <motion.div 
            className="max-w-4xl mx-auto mb-12"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <p className="text-xl sm:text-2xl text-white drop-shadow-lg leading-relaxed font-light">
              {language === 'bn' 
                ? 'এআই, ড্রোন ও আধুনিক প্রযুক্তির সাহায্যে আপনার কৃষিকাজকে করুন আরও লাভজনক ও সহজ।'
                : 'Make your farming more profitable and easier with AI, drones, and modern technology.'
              }
            </p>
            <p className="text-lg text-green-100 mt-4">
              {language === 'bn'
                ? 'বাংলা ভাষায় কথা বলে সহায়তা নিন - যেকোনো সময়, যেকোনো জায়গায়'
                : 'Get help by speaking in Bangla - anytime, anywhere'
              }
            </p>
          </motion.div>
          
          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="mb-16 flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Link href="/dashboard">
              <motion.button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform flex items-center space-x-2 min-w-[280px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{language === 'bn' ? 'এখনই শুরু করুন' : 'Get Started Now'}</span>
                <span className="text-2xl">🚀</span>
              </motion.button>
            </Link>
            
            <motion.button
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-5 text-lg font-semibold rounded-2xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-6 h-6" />
              <span>{language === 'bn' ? 'কণ্ঠে প্রশ্ন করুন' : 'Ask by Voice'}</span>
            </motion.button>

            <motion.button
              className="bg-transparent text-white border-2 border-white/50 px-8 py-5 text-lg font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6" />
              <span>{language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Demo'}</span>
            </motion.button>
          </motion.div>

          {/* Dynamic Trust Indicators */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(255,255,255,0.15)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center mb-3">
                    <IconComponent className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-green-100 text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Success Badges */}
          <motion.div 
            className="mt-12 flex flex-wrap justify-center items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="text-green-100 text-sm font-medium">✅ {language === 'bn' ? '২৪/৭ সহায়তা' : '24/7 Support'}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="text-green-100 text-sm font-medium">🏆 {language === 'bn' ? 'পুরস্কারপ্রাপ্ত' : 'Award Winning'}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="text-green-100 text-sm font-medium">🔒 {language === 'bn' ? '১০০% নিরাপদ' : '100% Secure'}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        <p className="text-white/70 text-xs mt-2 text-center">
          {language === 'bn' ? 'নিচে স্ক্রল করুন' : 'Scroll down'}
        </p>
      </motion.div>

      {/* Bottom Attribution */}
      <div className="absolute bottom-4 left-4 text-white/50 text-xs">
        Smart Agriculture Platform
      </div>
    </section>
  );
}