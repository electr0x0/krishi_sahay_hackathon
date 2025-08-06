'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  Droplets, 
  Users,
  Award,
  Globe,
  CheckCircle,
  ArrowUp
} from "lucide-react";

// Animated Counter Component
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const startValue = 0;
      const endValue = value;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);
        
        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function ImpactSection() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');

  const stats = [
    {
      id: '1',
      title: { bn: 'ফসলের ক্ষতি কমান', en: 'Crop Loss Reduction' },
      value: 35,
      suffix: '%',
      description: { 
        bn: 'AI এর মাধ্যমে আগাম সতর্কতায় ফসলের ক্ষতি কমান',
        en: 'Reduce crop losses through AI-powered early warnings'
      },
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgIcon: '🌾'
    },
    {
      id: '2',
      title: { bn: 'লাভ বৃদ্ধি', en: 'Profit Increase' },
      value: 50,
      suffix: '%',
      description: { 
        bn: 'সরাসরি ক্রেতার সাথে যোগাযোগে মধ্যস্বত্বভোগী বাদ দিয়ে লাভ বাড়ান',
        en: 'Increase profits by connecting directly with buyers, eliminating middlemen'
      },
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      bgIcon: '📈'
    },
    {
      id: '3',
      title: { bn: 'পানি সাশ্রয়', en: 'Water Savings' },
      value: 40,
      suffix: '%',
      description: { 
        bn: 'স্মার্ট সেচ ব্যবস্থায় পানির অপচয় রোধ করুন',
        en: 'Prevent water wastage with smart irrigation systems'
      },
      icon: Droplets,
      color: 'from-cyan-500 to-blue-500',
      bgIcon: '💧'
    },
    {
      id: '4',
      title: { bn: 'কৃষক সহায়তা', en: 'Farmers Supported' },
      value: 10000,
      suffix: '+',
      description: { 
        bn: 'দেশব্যাপী কৃষকদের ডিজিটাল সেবা প্রদান',
        en: 'Providing digital services to farmers nationwide'
      },
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgIcon: '👨‍🌾'
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: { bn: 'জাতীয় পুরস্কার', en: 'National Award' },
      description: { bn: 'সেরা কৃষি প্রযুক্তি ২০২৪', en: 'Best Agricultural Technology 2024' }
    },
    {
      icon: Globe,
      title: { bn: '৬৪ জেলায় সেবা', en: '64 Districts Coverage' },
      description: { bn: 'সারাদেশে আমাদের নেটওয়ার্ক', en: 'Our network across the country' }
    },
    {
      icon: CheckCircle,
      title: { bn: '৯৮% সন্তুষ্টি', en: '98% Satisfaction' },
      description: { bn: 'কৃষকদের মতামত', en: 'Farmer feedback' }
    }
  ];

  const sdgGoals = [
    {
      number: 2,
      title: { bn: 'ক্ষুধা নিবারণ', en: 'Zero Hunger' },
      description: { bn: 'খাদ্য নিরাপত্তা ও পুষ্টি', en: 'Food security and nutrition' },
      icon: '🎯',
      progress: 85
    },
    {
      number: 8,
      title: { bn: 'কর্মসংস্থান বৃদ্ধি', en: 'Decent Work' },
      description: { bn: 'গ্রামীণ কর্মসংস্থান', en: 'Rural employment' },
      icon: '💼',
      progress: 78
    },
    {
      number: 13,
      title: { bn: 'জলবায়ু সুরক্ষা', en: 'Climate Action' },
      description: { bn: 'টেকসই কৃষি', en: 'Sustainable agriculture' },
      icon: '🌍',
      progress: 92
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
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
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-all duration-300"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            {language === 'bn' ? 'আমাদের প্রভাব' : 'Our Impact'}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            {language === 'bn' 
              ? 'দেখুন কিভাবে কৃষি সহায় বাংলাদেশের কৃষকদের জীবনে ইতিবাচক পরিবর্তন এনেছে'
              : 'See how Krishi Sahay has brought positive changes to the lives of farmers in Bangladesh'
            }
          </motion.p>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <CardContent className="p-8 text-center relative z-10">
                    {/* Background Icon */}
                    <div className="absolute top-4 right-4 text-6xl opacity-10">
                      {stat.bgIcon}
                    </div>
                    
                    {/* Main Icon */}
                    <motion.div 
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    {/* Animated Number */}
                    <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                      <AnimatedCounter value={stat.value} />
                      <span className="ml-1">{stat.suffix}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {language === 'bn' ? stat.title.bn : stat.title.en}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {language === 'bn' ? stat.description.bn : stat.description.en}
                    </p>
                    
                    {/* Growth Indicator */}
                    <motion.div 
                      className="mt-4 flex items-center justify-center text-green-600"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {language === 'bn' ? 'ক্রমবর্ধমান' : 'Growing'}
                      </span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Achievements Section */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h3 
            className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-12"
            variants={itemVariants}
          >
            {language === 'bn' ? 'আমাদের অর্জনসমূহ' : 'Our Achievements'}
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'bn' ? achievement.title.bn : achievement.title.en}
                  </h4>
                  <p className="text-gray-600">
                    {language === 'bn' ? achievement.description.bn : achievement.description.en}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* SDG Alignment */}
        <motion.div 
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 lg:p-12 text-white mb-16 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-4 border-white"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-4 border-white"></div>
          </div>
          
          <div className="relative z-10">
            <motion.h3 
              className="text-2xl lg:text-3xl font-bold mb-8 text-center"
              variants={itemVariants}
            >
              {language === 'bn' ? 'টেকসই উন্নয়ন লক্ষ্যে আমাদের অবদান' : 'Our Contribution to SDGs'}
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sdgGoals.map((goal, index) => (
                <motion.div
                  key={goal.number}
                  variants={itemVariants}
                  className="text-center bg-white/20 backdrop-blur-sm p-6 rounded-2xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl mb-4">{goal.icon}</div>
                  <h4 className="font-bold mb-2 text-lg">
                    SDG {goal.number}
                  </h4>
                  <h5 className="font-semibold mb-2">
                    {language === 'bn' ? goal.title.bn : goal.title.en}
                  </h5>
                  <p className="text-green-100 text-sm mb-4">
                    {language === 'bn' ? goal.description.bn : goal.description.en}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <motion.div 
                      className="bg-white h-2 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${goal.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: index * 0.2 }}
                    />
                  </div>
                  <div className="text-sm text-green-100">
                    {goal.progress}% {language === 'bn' ? 'অগ্রগতি' : 'Progress'}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-8 lg:p-12 text-center">
              <motion.h3 
                className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4"
                variants={itemVariants}
              >
                {language === 'bn' 
                  ? 'আপনিও হয়ে উঠুন এই পরিবর্তনের অংশ' 
                  : 'Be Part of This Change'
                }
              </motion.h3>
              
              <motion.p 
                className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
                variants={itemVariants}
              >
                {language === 'bn'
                  ? 'আজই যোগ দিন কৃষি সহায় পরিবারে এবং করুন আপনার কৃষিকাজে বিপ্লব'
                  : 'Join the Krishi Sahay family today and revolutionize your farming'
                }
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={itemVariants}
              >
                <motion.button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'bn' ? 'আজই শুরু করুন' : 'Start Today'}
                </motion.button>
                
                <motion.a
                  href="/impact"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'bn' ? 'বিস্তারিত প্রভাব দেখুন' : 'View Detailed Impact'}
                </motion.a>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}