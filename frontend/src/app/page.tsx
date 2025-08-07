'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import HeroSection from "@/components/sections/HeroSection";
import FeatureHighlights from "@/components/sections/FeatureHighlights";
import HowItWorks from "@/components/sections/HowItWorks";
import ImpactSection from "@/components/sections/ImpactSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import TechnologyShowcase from "@/components/sections/TechnologyShowcase";
import Footer from "@/components/sections/Footer";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number]
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-green-700 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            কৃষি সহায় লোড হচ্ছে...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <motion.main
        className="min-h-screen relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
        </div>

        <motion.div variants={sectionVariants}>
          <HeroSection />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <FeatureHighlights />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <TechnologyShowcase />
        </motion.div>
        
        {/* IoT Dashboard Teaser */}
        <motion.div 
          variants={sectionVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🌡️ Real-time IoT Sensor Dashboard
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Monitor your farm&apos;s temperature, humidity, soil moisture, and water levels in real-time
              </p>
              <Link 
                href="/iot-dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                View Live Sensor Data →
              </Link>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <HowItWorks />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <ImpactSection />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <TestimonialsSection />
        </motion.div>
        
        <motion.div variants={sectionVariants}>
          <Footer />
        </motion.div>
      </motion.main>

    </>
  );
}