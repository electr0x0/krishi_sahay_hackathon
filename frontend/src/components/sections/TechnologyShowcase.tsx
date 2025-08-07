'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Drone, 
  Smartphone, 
  Satellite, 
  Camera, 
  MessageSquare,
  TrendingUp,
  CloudRain,
  Cpu,
  Mic
} from "lucide-react";

export default function TechnologyShowcase() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [activeTab, setActiveTab] = useState(0);

  const technologies = [
    {
      id: 'ai',
      title: { bn: 'কৃত্রিম বুদ্ধিমত্তা', en: 'Artificial Intelligence' },
      description: { 
        bn: 'বাংলা ভাষায় কথা বলে সহায়তা নিন। আপনার ফসলের সমস্যার সমাধান পান তাৎক্ষণিক।',
        en: 'Get help by speaking in Bangla. Instant solutions for your crop problems.'
      },
      icon: Brain,
      features: [
        { bn: 'বাংলা ভয়েস কমান্ড', en: 'Bangla Voice Commands' },
        { bn: 'স্মার্ট সুপারিশ', en: 'Smart Recommendations' },
        { bn: '২৪/৭ সহায়তা', en: '24/7 Support' },
        { bn: 'রোগ নির্ণয়', en: 'Disease Detection' }
      ],
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'drone',
      title: { bn: 'ড্রোন প্রযুক্তি', en: 'Drone Technology' },
      description: { 
        bn: 'আকাশ থেকে আপনার ফসলের স্বাস্থ্য পর্যবেক্ষণ করুন। রোগ ও পোকার আক্রমণ আগেই জানুন।',
        en: 'Monitor your crop health from the sky. Early detection of diseases and pests.'
      },
      icon: Drone,
      features: [
        { bn: 'ফসল পর্যবেক্ষণ', en: 'Crop Monitoring' },
        { bn: 'স্প্রে করা', en: 'Precision Spraying' },
        { bn: 'রোগ সনাক্তকরণ', en: 'Disease Detection' },
        { bn: 'মানচিত্র তৈরি', en: 'Field Mapping' }
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'iot',
      title: { bn: 'স্মার্ট সেন্সর', en: 'Smart Sensors' },
      description: { 
        bn: 'মাটির আর্দ্রতা, তাপমাত্রা ও পুষ্টির পরিমাণ রিয়েল-টাইমে জানুন।',
        en: 'Real-time monitoring of soil moisture, temperature, and nutrients.'
      },
      icon: Cpu,
      features: [
        { bn: 'মাটির আর্দ্রতা', en: 'Soil Moisture' },
        { bn: 'তাপমাত্রা পর্যবেক্ষণ', en: 'Temperature Monitoring' },
        { bn: 'স্বয়ংক্রিয় সেচ', en: 'Auto Irrigation' },
        { bn: 'পুষ্টি বিশ্লেষণ', en: 'Nutrient Analysis' }
      ],
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'satellite',
      title: { bn: 'স্যাটেলাইট ইমেজিং', en: 'Satellite Imaging' },
      description: { 
        bn: 'উপগ্রহ থেকে পাওয়া ছবি বিশ্লেষণ করে ফসলের বৃদ্ধি ও স্বাস্থ্য পর্যবেক্ষণ।',
        en: 'Analyze satellite images to monitor crop growth and health.'
      },
      icon: Satellite,
      features: [
        { bn: 'ফসলের বৃদ্ধি ট্র্যাকিং', en: 'Growth Tracking' },
        { bn: 'ক্ষেত্র বিশ্লেষণ', en: 'Field Analysis' },
        { bn: 'ফলন পূর্বাভাস', en: 'Yield Prediction' },
        { bn: 'আবহাওয়া পূর্বাভাস', en: 'Weather Forecast' }
      ],
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-all duration-300 shadow-md"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8"
            variants={itemVariants}
          >
           <div > {language === 'bn' ? 'আধুনিক প্রযুক্তি' : 'Modern Technology'}</div>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500  ">
              {language === 'bn' ? 'কৃষিতে বিপ্লব' : 'Agricultural Revolution'}
            </span>
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            {language === 'bn' 
              ? 'এআই, ড্রোন, স্যাটেলাইট ও IoT প্রযুক্তির সমন্বয়ে তৈরি করেছি বাংলাদেশের সবচেয়ে উন্নত কৃষি প্ল্যাটফর্ম।'
              : 'Combining AI, drones, satellites, and IoT technology to create Bangladesh\'s most advanced agricultural platform.'
            }
          </motion.p>
        </motion.div>

        {/* Technology Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <motion.button
                key={tech.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  activeTab === index
                    ? `bg-gradient-to-r ${tech.color} text-white shadow-lg scale-105`
                    : 'bg-white/80 text-gray-700 hover:bg-white shadow-md hover:scale-105'
                }`}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-sm sm:text-base">
                  {language === 'bn' ? tech.title.bn : tech.title.en}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Active Technology Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Content Side */}
                  <div className="p-8 lg:p-12">
                    <div className="flex items-center space-x-4 mb-6">
                      {(() => {
                        const IconComponent = technologies[activeTab].icon;
                        return (
                          <div className={`p-4 rounded-2xl bg-gradient-to-r ${technologies[activeTab].color}`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                        );
                      })()}
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                          {language === 'bn' 
                            ? technologies[activeTab].title.bn 
                            : technologies[activeTab].title.en
                          }
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {language === 'bn' 
                        ? technologies[activeTab].description.bn 
                        : technologies[activeTab].description.en
                      }
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {technologies[activeTab].features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${technologies[activeTab].color}`} />
                          <span className="text-gray-700 font-medium">
                            {language === 'bn' ? feature.bn : feature.en}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Visual Side */}
                  <div className={`bg-gradient-to-br ${technologies[activeTab].color} p-8 lg:p-12 flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-4 border-white"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-4 border-white"></div>
                    </div>
                    
                    <motion.div
                      className="relative z-10 text-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {(() => {
                        const IconComponent = technologies[activeTab].icon;
                        return <IconComponent className="w-32 h-32 text-white mx-auto mb-6" />;
                      })()}
                      
                      <h4 className="text-2xl font-bold text-white mb-4">
                        {language === 'bn' ? 'এখনই ব্যবহার করুন' : 'Use Now'}
                      </h4>
                      
                      <motion.button
                        className="bg-white text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {language === 'bn' ? 'শুরু করুন' : 'Get Started'}
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Stats */}
        <motion.div 
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {[
            { 
              number: '৯৯%', 
              label: { bn: 'নির্ভুলতা', en: 'Accuracy' },
              icon: '🎯'
            },
            { 
              number: '৫০%', 
              label: { bn: 'খরচ সাশ্রয়', en: 'Cost Reduction' },
              icon: '💰'
            },
            { 
              number: '২৪/৭', 
              label: { bn: 'সেবা', en: 'Service' },
              icon: '🚀'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center bg-white/60 backdrop-blur-sm p-6 rounded-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">
                {language === 'bn' ? stat.label.bn : stat.label.en}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}