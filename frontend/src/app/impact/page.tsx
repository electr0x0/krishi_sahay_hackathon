'use client';

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/sections/Footer";
import { 
  TrendingUp, 
  DollarSign, 
  Droplets, 
  Users,
  Award,
  Globe,
  Target,
  Leaf,
  CheckCircle,
  Sprout,
  Shield,
  Heart,
  TreePine,
  Wheat,
  Factory,
  Home,
  MapPin,
  Calendar,
  BarChart3,
  TrendingDown,
  ArrowRight,
  Star,
  Sparkles,
  ThumbsUp,
  Brain,
  Smartphone,
  Network,
  Volume2,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingCard, GradientText } from "@/components/ui/aceternity";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Animated Counter Component
const AnimatedCounterComponent = ({ value, duration = 2000, suffix = "", prefix = "" }: { 
  value: number; 
  duration?: number; 
  suffix?: string;
  prefix?: string;
}) => {
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

  return (
    <div ref={ref} className="font-bold text-3xl md:text-4xl lg:text-5xl text-slate-800">
      {prefix}{count}{suffix}
    </div>
  );
};

// Impact Categories
const impactCategories = [
  {
    id: "agricultural",
    title: "কৃষি উৎপাদনে প্রভাব",
    icon: Wheat,
    color: "emerald",
    description: "ফসল উৎপাদন ও গুণগত মান বৃদ্ধি",
    metrics: [
      { value: 35, suffix: "%", label: "ফসলের উৎপাদন বৃদ্ধি", icon: TrendingUp },
      { value: 60, suffix: "%", label: "ফসলের ক্ষতি হ্রাস", icon: Shield },
      { value: 45, suffix: "%", label: "কীটনাশক ব্যবহার কমেছে", icon: Leaf },
      { value: 25, suffix: "%", label: "বীজের গুণগত মান বৃদ্ধি", icon: Sprout }
    ]
  },
  {
    id: "economic",
    title: "অর্থনৈতিক প্রভাব",
    icon: DollarSign,
    color: "green",
    description: "কৃষকদের আয় ও লাভজনকতা বৃদ্ধি",
    metrics: [
      { value: 50, suffix: "%", label: "কৃষকদের আয় বৃদ্ধি", icon: TrendingUp },
      { value: 30, suffix: "%", label: "খরচ সাশ্রয়", icon: TrendingDown },
      { value: 40, suffix: "%", label: "বাজার প্রবেশাধিকার বৃদ্ধি", icon: Target },
      { value: 70, suffix: "%", label: "মধ্যস্বত্বভোগী এড়ানো", icon: Users }
    ]
  },
  {
    id: "environmental",
    title: "পরিবেশগত প্রভাব",
    icon: Globe,
    color: "emerald",
    description: "টেকসই কৃষি ও পরিবেশ সংরক্ষণ",
    metrics: [
      { value: 40, suffix: "%", label: "পানির ব্যবহার হ্রাস", icon: Droplets },
      { value: 55, suffix: "%", label: "রাসায়নিক নিঃসরণ কমেছে", icon: Factory },
      { value: 20, suffix: "%", label: "কার্বন নিঃসরণ হ্রাস", icon: TreePine },
      { value: 35, suffix: "%", label: "মাটির স্বাস্থ্য উন্নতি", icon: Heart }
    ]
  },
  {
    id: "social",
    title: "সামাজিক প্রভাব",
    icon: Users,
    color: "green",
    description: "সমাজ ও কমিউনিটি উন্নয়ন",
    metrics: [
      { value: 85, suffix: "%", label: "কৃষক সন্তুষ্টি", icon: ThumbsUp },
      { value: 15000, suffix: "+", label: "উপকৃত কৃষক পরিবার", icon: Home },
      { value: 500, suffix: "+", label: "গ্রামীণ এলাকায় পৌঁছানো", icon: MapPin },
      { value: 95, suffix: "%", label: "প্রযুক্তি গ্রহণযোগ্যতা", icon: Smartphone }
    ]
  }
];

// SDG Goals
const sdgGoals = [
  {
    id: 1,
    title: "দারিদ্র্য বিমোচন",
    description: "কৃষকদের আয় বৃদ্ধি করে দারিদ্র্য হ্রাস",
    icon: Target,
    progress: 75,
    achievements: [
      "১৫,০০০+ কৃষক পরিবারের আয় বৃদ্ধি",
      "৫০% গড় আয় বৃদ্ধি",
      "গ্রামীণ অর্থনীতিতে ইতিবাচক প্রভাব"
    ]
  },
  {
    id: 2,
    title: "ক্ষুধা নিরসন",
    description: "খাদ্য নিরাপত্তা ও পুষ্টি উন্নয়ন",
    icon: Wheat,
    progress: 80,
    achievements: [
      "৩৫% ফসল উৎপাদন বৃদ্ধি",
      "খাদ্য গুণগত মান উন্নতি",
      "স্থানীয় খাদ্য ব্যবস্থা শক্তিশালী করা"
    ]
  },
  {
    id: 13,
    title: "জলবায়ু পরিবর্তন মোকাবেলা",
    description: "টেকসই কৃষি পদ্ধতি ও জলবায়ু অভিযোজন",
    icon: Globe,
    progress: 65,
    achievements: [
      "৪০% পানি সাশ্রয়",
      "২০% কার্বন নিঃসরণ হ্রাস",
      "জলবায়ু-স্মার্ট কৃষি প্রচার"
    ]
  }
];

// Technology Impact
const technologyImpacts = [
  {
    title: "AI & Machine Learning",
    description: "কৃত্রিম বুদ্ধিমত্তা দিয়ে স্মার্ট কৃষি সমাধান",
    icon: Brain,
    metrics: [
      { label: "রোগ নির্ণয়ের নির্ভুলতা", value: 95, suffix: "%" },
      { label: "ফসল পূর্বাভাসের সঠিকতা", value: 88, suffix: "%" }
    ],
    features: [
      "Llama-4 ভিত্তিক বাংলা ভাষা মডেল",
      "Computer Vision দিয়ে রোগ সনাক্তকরণ",
      "RAG সিস্টেম দিয়ে রিয়েল-টাইম তথ্য"
    ]
  },
  {
    title: "IoT & Sensor Network",
    description: "স্মার্ট সেন্সর দিয়ে রিয়েল-টাইম পর্যবেক্ষণ",
    icon: Network,
    metrics: [
      { label: "সেচের পানি সাশ্রয়", value: 40, suffix: "%" },
      { label: "সেন্সর নেটওয়ার্ক কভারেজ", value: 85, suffix: "%" }
    ],
    features: [
      "মাটির আর্দ্রতা ও pH পর্যবেক্ষণ",
      "আবহাওয়া ডেটা ইন্টিগ্রেশন",
      "স্বয়ংক্রিয় সেচ ব্যবস্থা"
    ]
  },
  {
    title: "Voice & Accessibility",
    description: "বাংলা ভয়েস ইন্টারফেস ও অ্যাক্সেসিবিলিটি",
    icon: Volume2,
    metrics: [
      { label: "ভয়েস কমান্ড নির্ভুলতা", value: 92, suffix: "%" },
      { label: "নিরক্ষর কৃষকদের ব্যবহার", value: 78, suffix: "%" }
    ],
    features: [
      "বাংলা STT ও TTS সিস্টেম",
      "অফলাইন ভয়েস কমান্ড",
      "সহজ ব্যবহারের ইন্টারফেস"
    ]
  },
  {
    title: "Market Platform (MCP)",
    description: "স্বচ্ছ বাজার ব্যবস্থা ও সরাসরি বিক্রয়",
    icon: BarChart3,
    metrics: [
      { label: "মধ্যস্বত্বভোগী এড়ানো", value: 70, suffix: "%" },
      { label: "বাজার দর স্বচ্ছতা", value: 90, suffix: "%" }
    ],
    features: [
      "DAM ও BARC ডেটা ইন্টিগ্রেশন",
      "রিয়েল-টাইম দাম পূর্বাভাস",
      "সরাসরি ক্রেতা-বিক্রেতা সংযোগ"
    ]
  }
];

// Success Stories
const successStories = [
  {
    name: "মো. রহিম উদ্দিন",
    location: "নরসিংদী",
    crop: "ধান",
    improvement: "৬০% উৎপাদন বৃদ্ধি",
    story: "AI পরামর্শ ও স্মার্ট সেচের মাধ্যমে আমার ধানের ক্ষেতে রেকর্ড ফলন হয়েছে।",
    avatar: "👨‍🌾",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&crop=center",
    metrics: { yield: 60, income: 45, satisfaction: 95 }
  },
  {
    name: "মোসা. ফাতেমা খাতুন",
    location: "কুমিল্লা",
    crop: "সবজি",
    improvement: "৭০% আয় বৃদ্ধি",
    story: "ভয়েস কমান্ডের মাধ্যমে সহজেই ফসলের যত্ন নিতে পারি এবং সরাসরি বিক্রয় করি।",
    avatar: "👩‍🌾",
    image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop&crop=center",
    metrics: { yield: 45, income: 70, satisfaction: 90 }
  },
  {
    name: "আব্দুল কারিম",
    location: "রংপুর",
    crop: "আলু",
    improvement: "৫০% খরচ হ্রাস",
    story: "IoT সেন্সর দিয়ে সঠিক সময়ে সেচ ও সার প্রয়োগ করে খরচ অনেক কমেছে।",
    avatar: "👨‍🌾",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&h=300&fit=crop&crop=center",
    metrics: { yield: 40, income: 50, satisfaction: 88 }
  }
];

// Future Projections
const futureProjections = [
  {
    year: "২০২৫",
    title: "সম্প্রসারণ পর্যায়",
    targets: [
      { label: "উপকৃত কৃষক", value: 50000, suffix: "+" },
      { label: "কভার এলাকা", value: 20, suffix: " জেলা" },
      { label: "প্রযুক্তি গ্রহণ", value: 85, suffix: "%" }
    ],
    initiatives: [
      "নতুন ১৫টি জেলায় বিস্তার",
      "আরো স্মার্ট ফিচার সংযোজন",
      "কৃষক প্রশিক্ষণ কর্মসূচি"
    ]
  },
  {
    year: "২০২৬",
    title: "উন্নত প্রযুক্তি",
    targets: [
      { label: "AI নির্ভুলতা", value: 98, suffix: "%" },
      { label: "ভয়েস সাপোর্ট", value: 95, suffix: "%" },
      { label: "অটোমেশন", value: 80, suffix: "%" }
    ],
    initiatives: [
      "নতুন AI মডেল ডেপলয়মেন্ট",
      "সম্পূর্ণ অটোমেশন সিস্টেম",
      "ব্লকচেইন ইন্টিগ্রেশন"
    ]
  },
  {
    year: "২০২৭",
    title: "জাতীয় স্কেল",
    targets: [
      { label: "সারাদেশে কভারেজ", value: 100, suffix: "%" },
      { label: "কৃষক পরিবার", value: 200000, suffix: "+" },
      { label: "জাতীয় প্রভাব", value: 15, suffix: "% জিডিপি" }
    ],
    initiatives: [
      "সরকারি নীতিমালায় অন্তর্ভুক্তি",
      "আন্তর্জাতিক সহযোগিতা",
      "গবেষণা ও উন্নয়ন কেন্দ্র"
    ]
  }
];

const ImpactPage = () => {
  const [activeCategory, setActiveCategory] = useState("agricultural");
  const [selectedStory, setSelectedStory] = useState(0);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative py-20 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden"
        >
          {/* Background Images */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=300&fit=crop&crop=center"
                alt="Smart farming"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-20 right-20 w-40 h-40 rounded-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center"
                alt="Crops growing"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute bottom-20 left-1/4 w-36 h-36 rounded-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=350&h=350&fit=crop&crop=center"
                alt="Farmer with technology"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="absolute inset-0 bg-green-50/30" style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%2359C659' fill-opacity='0.05'%3e%3ccircle cx='30' cy='30' r='4'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`
          }} />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-8"
              >
                <Award className="w-10 h-10 text-green-600" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
                আমাদের <GradientText>প্রভাব</GradientText> ও অর্জন
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
                বাংলাদেশের কৃষি খাতে AI-চালিত প্রযুক্তির মাধ্যমে আমরা যে ইতিবাচক পরিবর্তন এনেছি, 
                তার বিস্তারিত তুলে ধরা হয়েছে এখানে।
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap justify-center gap-6 text-center mb-12"
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                  <AnimatedCounterComponent value={15000} suffix="+" />
                  <p className="text-slate-600 mt-2">উপকৃত কৃষক পরিবার</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
                  <AnimatedCounterComponent value={35} suffix="%" />
                  <p className="text-slate-600 mt-2">উৎপাদন বৃদ্ধি</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                  <AnimatedCounterComponent value={50} suffix="%" />
                  <p className="text-slate-600 mt-2">আয় বৃদ্ধি</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
                  <AnimatedCounterComponent value={40} suffix="%" />
                  <p className="text-slate-600 mt-2">পানি সাশ্রয়</p>
                </div>
              </motion.div>

              {/* Hero Image Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                  <Image
                    src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=250&h=250&fit=crop&crop=center"
                    alt="AI-powered crop analysis"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/20 group-hover:bg-green-600/30 transition-colors duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">
                    AI ফসল বিশ্লেষণ
                  </div>
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                  <Image
                    src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=250&h=250&fit=crop&crop=center"
                    alt="Smart irrigation system"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-emerald-600/20 group-hover:bg-emerald-600/30 transition-colors duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">
                    স্মার্ট সেচ
                  </div>
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                  <Image
                    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=250&h=250&fit=crop&crop=center"
                    alt="Market price prediction"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/20 group-hover:bg-green-600/30 transition-colors duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">
                    বাজার পূর্বাভাস
                  </div>
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&h=250&fit=crop&crop=center"
                    alt="Happy farmers"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-emerald-600/20 group-hover:bg-emerald-600/30 transition-colors duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium">
                    সফল কৃষক
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Impact Categories */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>বিস্তারিত প্রভাব</GradientText> বিশ্লেষণ
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আমাদের AI প্ল্যাটফর্ম কৃষি, অর্থনৈতিক, পরিবেশগত ও সামাজিক প্রতিটি ক্ষেত্রে 
                উল্লেখযোগ্য ইতিবাচক প্রভাব ফেলেছে
              </p>
            </motion.div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {impactCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 ${
                      activeCategory === category.id
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="hidden sm:inline">{category.title}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Category Content */}
            <AnimatePresence mode="wait">
              {impactCategories.map((category) => (
                activeCategory === category.id && (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-6xl mx-auto"
                  >
                    <FloatingCard className="p-8 mb-12">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className={`w-16 h-16 bg-${category.color}-100 rounded-2xl flex items-center justify-center`}>
                          <category.icon className={`w-8 h-8 text-${category.color}-600`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">{category.title}</h3>
                          <p className="text-slate-600">{category.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {category.metrics.map((metric, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="text-center p-6 bg-slate-50 rounded-xl hover:shadow-lg transition-shadow duration-300"
                          >
                            <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                              <metric.icon className={`w-6 h-6 text-${category.color}-600`} />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 mb-2">
                              <AnimatedCounterComponent value={metric.value} suffix={metric.suffix} />
                            </div>
                            <p className="text-slate-600 text-sm">{metric.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </FloatingCard>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* SDG Goals */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>টেকসই উন্নয়ন লক্ষ্য</GradientText> (SDG) অবদান
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                জাতিসংঘের টেকসই উন্নয়ন লক্ষ্য অর্জনে আমাদের প্ল্যাটফর্মের গুরুত্বপূর্ণ ভূমিকা
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {sdgGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FloatingCard className="h-full">
                    <div className="p-8">
                      {/* SDG Visual Header */}
                      <div className="relative mb-6 p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                              SDG {goal.id}
                            </Badge>
                            <span className="text-2xl font-bold">{goal.progress}%</span>
                          </div>
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <goal.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                        <p className="text-green-100 text-sm">{goal.description}</p>
                        
                        {/* Progress indicator in header */}
                        <div className="mt-4">
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${goal.progress}%` }}
                              transition={{ duration: 1.5, delay: 0.3 }}
                              viewport={{ once: true }}
                              className="bg-white h-2 rounded-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                          <goal.icon className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              SDG {goal.id}
                            </Badge>
                            <span className="text-2xl font-bold text-green-600">{goal.progress}%</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">{goal.title}</h3>
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800">মূল অর্জনসমূহ:</h4>
                        {goal.achievements.map((achievement, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-600">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Impact */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>প্রযুক্তিগত প্রভাব</GradientText> ও কর্মক্ষমতা
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আমাদের AI, IoT, এবং অন্যান্য প্রযুক্তি কীভাবে বাস্তব জীবনে প্রভাব ফেলছে
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {technologyImpacts.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FloatingCard className="h-full">
                    <div className="p-8">
                      {/* Technology Image */}
                      <div className="relative mb-6 rounded-xl overflow-hidden shadow-md">
                        <Image
                          src={
                            index === 0 ? "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop&crop=center" :
                            index === 1 ? "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=200&fit=crop&crop=center" :
                            index === 2 ? "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=200&fit=crop&crop=center" :
                            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop&crop=center"
                          }
                          alt={tech.title}
                          width={400}
                          height={200}
                          className="w-full h-32 object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-emerald-600/20" />
                        <div className="absolute top-3 left-3">
                          <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                            <tech.icon className="w-5 h-5 text-emerald-600" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <tech.icon className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{tech.title}</h3>
                          <p className="text-slate-600">{tech.description}</p>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {tech.metrics.map((metric, i) => (
                          <div key={i} className="text-center p-4 bg-emerald-50 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-600">
                              <AnimatedCounterComponent value={metric.value} suffix={metric.suffix} />
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{metric.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800">মূল বৈশিষ্ট্যসমূহ:</h4>
                        {tech.features.map((feature, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Visualization Section */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>ডেটা ভিজ্যুয়ালাইজেশন</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                আমাদের প্রভাবের বিস্তারিত বিশ্লেষণ গ্রাফ ও চার্টের মাধ্যমে
              </p>

              {/* Visual Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute inset-0 bg-green-100 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-green-100">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">6</div>
                    <div className="text-xs text-slate-600">ফসলের ধরন</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-100 rounded-2xl transform -rotate-2 group-hover:-rotate-4 transition-transform duration-300"></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">5</div>
                    <div className="text-xs text-slate-600">খরচের খাত</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-green-100 rounded-2xl transform rotate-1 group-hover:rotate-3 transition-transform duration-300"></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-green-100">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-xs text-slate-600">মাসের ডেটা</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-emerald-100 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">3</div>
                    <div className="text-xs text-slate-600">চার্টের ধরন</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Yield Improvement Chart */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <FloatingCard>
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">ফসলের উৎপাদন বৃদ্ধি</h3>
                        <p className="text-slate-600">বিভিন্ন ফসলের উৎপাদন বৃদ্ধির হার</p>
                      </div>
                    </div>

                    <div className="h-64">
                      <Bar
                        data={{
                          labels: ['ধান', 'গম', 'আলু', 'সবজি', 'ডাল', 'তেল বীজ'],
                          datasets: [
                            {
                              label: 'উৎপাদন বৃদ্ধি (%)',
                              data: [35, 42, 28, 55, 38, 45],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(16, 185, 129, 0.8)', 
                                'rgba(5, 150, 105, 0.8)',
                                'rgba(6, 120, 90, 0.8)',
                                'rgba(4, 108, 78, 0.8)',
                                'rgba(6, 95, 70, 0.8)'
                              ],
                              borderColor: [
                                'rgba(34, 197, 94, 1)',
                                'rgba(16, 185, 129, 1)',
                                'rgba(5, 150, 105, 1)',
                                'rgba(6, 120, 90, 1)',
                                'rgba(4, 108, 78, 1)',
                                'rgba(6, 95, 70, 1)'
                              ],
                              borderWidth: 2,
                              borderRadius: 8,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 60,
                              ticks: {
                                callback: function(value) {
                                  return value + '%';
                                }
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </FloatingCard>
              </motion.div>

              {/* Cost Reduction Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <FloatingCard>
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">খরচ সাশ্রয় বিভাজন</h3>
                        <p className="text-slate-600">বিভিন্ন খাতে খরচ কমানোর অনুপাত</p>
                      </div>
                    </div>

                    <div className="h-64">
                      <Pie
                        data={{
                          labels: ['সেচ খরচ', 'সার খরচ', 'কীটনাশক', 'শ্রমিক খরচ', 'অন্যান্য'],
                          datasets: [
                            {
                              data: [40, 25, 20, 10, 5],
                              backgroundColor: [
                                '#22c55e',
                                '#10b981',
                                '#059669',
                                '#047857',
                                '#065f46'
                              ],
                              borderColor: '#ffffff',
                              borderWidth: 3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom' as const,
                              labels: {
                                usePointStyle: true,
                                padding: 20,
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </FloatingCard>
              </motion.div>
            </div>

            {/* Growth Timeline Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <FloatingCard>
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">প্ল্যাটফর্মের বৃদ্ধি</h3>
                      <p className="text-slate-600">সময়ের সাথে ব্যবহারকারী ও প্রভাব বৃদ্ধি</p>
                    </div>
                  </div>

                  <div className="h-80">
                    <Line
                      data={{
                        labels: ['জানুয়ারি ২০২৪', 'মার্চ ২০২৪', 'মে ২০২৪', 'জুলাই ২০২৪', 'সেপ্টেম্বর ২০২৪', 'নভেম্বর ২০২৪', 'জানুয়ারি ২০২৫'],
                        datasets: [
                          {
                            label: 'ব্যবহারকারী (হাজারে)',
                            data: [2, 5, 8, 12, 18, 25, 35],
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgb(34, 197, 94)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                          },
                          {
                            label: 'ফসল উৎপাদন বৃদ্ধি (%)',
                            data: [5, 10, 15, 22, 28, 32, 35],
                            borderColor: 'rgb(16, 185, 129)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: 'rgb(16, 185, 129)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                          mode: 'index' as const,
                          intersect: false,
                        },
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              usePointStyle: true,
                              padding: 20,
                            }
                          },
                        },
                        scales: {
                          x: {
                            display: true,
                            title: {
                              display: true,
                              text: 'সময়কাল'
                            }
                          },
                          y: {
                            display: true,
                            title: {
                              display: true,
                              text: 'মান'
                            },
                            suggestedMin: 0,
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </div>
        </section>

        {/* Real-time Impact Dashboard */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>লাইভ ইম্প্যাক্ট ড্যাশবোর্ড</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                রিয়েল-টাইম ডেটা দিয়ে আমাদের প্রভাবের সরাসরি পর্যবেক্ষণ
              </p>
            </motion.div>

            {/* Live Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { 
                  title: "আজকের নতুন ব্যবহারকারী", 
                  value: 127, 
                  change: "+12%", 
                  icon: Users, 
                  color: "green",
                  trend: "up"
                },
                { 
                  title: "সাপ্তাহিক AI পরামর্শ", 
                  value: 2847, 
                  change: "+8%", 
                  icon: Brain, 
                  color: "emerald",
                  trend: "up"
                },
                { 
                  title: "পানি সাশ্রয় (লিটার)", 
                  value: 45230, 
                  change: "+15%", 
                  icon: Droplets, 
                  color: "green",
                  trend: "up"
                },
                { 
                  title: "কৃষক সন্তুষ্টি", 
                  value: 94.8, 
                  change: "+2.1%", 
                  icon: ThumbsUp, 
                  color: "emerald",
                  trend: "up",
                  suffix: "%"
                },
              ].map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <FloatingCard className="relative overflow-hidden">
                      <div className="p-6">
                        {/* Live indicator */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-600 font-medium">লাইভ</span>
                          </div>
                          <div className={`w-10 h-10 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 text-${metric.color}-600`} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-slate-600">{metric.title}</h3>
                          <div className="flex items-end space-x-2">
                            <AnimatedCounterComponent 
                              value={metric.value} 
                              suffix={metric.suffix || ""} 
                              duration={1500}
                            />
                            <div className={`flex items-center text-xs font-medium ${
                              metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {metric.trend === 'up' ? '↗' : '↘'} {metric.change}
                            </div>
                          </div>
                        </div>

                        {/* Activity indicator */}
                        <div className="mt-4">
                          <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3 text-slate-400" />
                            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-${metric.color}-500 rounded-full`}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${Math.random() * 100}%` }}
                                transition={{ duration: 2, delay: index * 0.2 }}
                                viewport={{ once: true }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </FloatingCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Live Updates Feed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <FloatingCard>
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">সাম্প্রতিক কার্যক্রম</h3>
                      <p className="text-slate-600">গত ২৪ ঘন্টার আপডেট</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { 
                        time: "৫ মিনিট আগে", 
                        action: "নরসিংদীর রহিম উদ্দিন ধানের রোগ নির্ণয় করেছেন", 
                        type: "diagnosis", 
                        icon: "🌾" 
                      },
                      { 
                        time: "১৫ মিনিট আগে", 
                        action: "কুমিল্লায় ১২০ লিটার পানি সাশ্রয় হয়েছে স্মার্ট সেচ দিয়ে", 
                        type: "irrigation", 
                        icon: "💧" 
                      },
                      { 
                        time: "৩০ মিনিট আগে", 
                        action: "রংপুরের কারিম সাহেব আলুর বাজার দর পূর্বাভাস দেখেছেন", 
                        type: "market", 
                        icon: "📈" 
                      },
                      { 
                        time: "১ ঘন্টা আগে", 
                        action: "৫টি নতুন কৃষক পরিবার প্ল্যাটফর্মে যোগ দিয়েছেন", 
                        type: "user", 
                        icon: "👨‍🌾" 
                      },
                      { 
                        time: "২ ঘন্টা আগে", 
                        action: "সিলেটে ভয়েস কমান্ড দিয়ে ৮৫% সফল ইন্টারঅ্যাকশন", 
                        type: "voice", 
                        icon: "🎤" 
                      },
                    ].map((update, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
                          {update.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-800 font-medium">{update.action}</p>
                          <p className="text-xs text-slate-500 mt-1">{update.time}</p>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button variant="outline" className="px-6">
                      সব আপডেট দেখুন
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </div>
        </section>

        {/* Before/After Comparison */}
        <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>আগে বনাম এখন</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আমাদের প্ল্যাটফর্ম ব্যবহারের আগে ও পরে কৃষকদের অবস্থার তুলনা
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Before */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* Before Image */}
                <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&h=300&fit=crop&crop=center"
                    alt="Traditional farming methods"
                    width={600}
                    height={300}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <TrendingDown className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-lg font-semibold">ঐতিহ্যগত পদ্ধতি</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">প্রযুক্তি ব্যবহারের আগে</h3>
                  <p className="text-slate-600">ঐতিহ্যগত কৃষি পদ্ধতি</p>
                </div>

                <div className="space-y-6">
                  {[
                    { metric: "ফসলের ক্ষতি", value: "40-60%", icon: "😞", color: "red" },
                    { metric: "পানির অপচয়", value: "50-70%", icon: "💧", color: "red" },
                    { metric: "অনুমান নির্ভর সিদ্ধান্ত", value: "80%", icon: "🤔", color: "red" },
                    { metric: "মধ্যস্বত্বভোগী নির্ভরতা", value: "90%", icon: "😤", color: "red" },
                    { metric: "রোগ নির্ণয়ের দেরি", value: "৫-১০ দিন", icon: "⏰", color: "red" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-red-100"
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.metric}</p>
                        <p className="text-red-600 font-bold">{item.value}</p>
                      </div>
                      <div className="w-12 h-2 bg-red-200 rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* After */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                {/* After Image */}
                <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=300&fit=crop&crop=center"
                    alt="Modern AI-powered smart farming"
                    width={600}
                    height={300}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/30 flex items-center justify-center">
                    <div className="text-center text-white">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-lg font-semibold">AI স্মার্ট কৃষি</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">প্রযুক্তি ব্যবহারের পরে</h3>
                  <p className="text-slate-600">AI-চালিত স্মার্ট কৃষি</p>
                </div>

                <div className="space-y-6">
                  {[
                    { metric: "ফসলের ক্ষতি", value: "10-15%", icon: "😊", color: "green", improvement: "60% কমেছে" },
                    { metric: "পানির অপচয়", value: "15-25%", icon: "💚", color: "green", improvement: "40% সাশ্রয়" },
                    { metric: "ডেটা-চালিত সিদ্ধান্ত", value: "95%", icon: "🤓", color: "green", improvement: "AI পরামর্শ" },
                    { metric: "সরাসরি বিক্রয়", value: "70%", icon: "🤝", color: "green", improvement: "MCP প্ল্যাটফর্ম" },
                    { metric: "রোগ নির্ণয়", value: "তাৎক্ষণিক", icon: "⚡", color: "green", improvement: "Computer Vision" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-green-100 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-bl-lg">
                        {item.improvement}
                      </div>
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.metric}</p>
                        <p className="text-green-600 font-bold">{item.value}</p>
                      </div>
                      <div className="w-12 h-2 bg-green-200 rounded-full">
                        <motion.div 
                          className="h-full bg-green-500 rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: '90%' }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          viewport={{ once: true }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Overall Impact Summary */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-16 text-center"
            >
              <FloatingCard className="max-w-4xl mx-auto">
                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        <AnimatedCounterComponent value={35} suffix="%" />
                      </div>
                      <p className="text-slate-600 font-medium">গড় উৎপাদন বৃদ্ধি</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">
                        <AnimatedCounterComponent value={50} suffix="%" />
                      </div>
                      <p className="text-slate-600 font-medium">গড় আয় বৃদ্ধি</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        <AnimatedCounterComponent value={95} suffix="%" />
                      </div>
                      <p className="text-slate-600 font-medium">কৃষক সন্তুষ্টি</p>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>সফলতার গল্প</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                বাস্তব কৃষকদের সফলতার অভিজ্ঞতা যারা আমাদের প্রযুক্তি ব্যবহার করে লাভবান হয়েছেন
              </p>
            </motion.div>

            <div className="max-w-6xl mx-auto">
              {/* Story Navigation */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-2">
                  {successStories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedStory(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        selectedStory === index ? 'bg-green-600' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedStory}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                >
                  <FloatingCard>
                    <div className="p-8 lg:p-12">
                      {/* Story Image Header */}
                      <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
                        <Image
                          src={successStories[selectedStory].image}
                          alt={`${successStories[selectedStory].name} - ${successStories[selectedStory].crop} farmer`}
                          width={800}
                          height={300}
                          className="w-full h-48 object-cover"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">{successStories[selectedStory].avatar}</div>
                            <div>
                              <h3 className="text-xl font-bold">{successStories[selectedStory].name}</h3>
                              <p className="text-sm opacity-90">{successStories[selectedStory].location} • {successStories[selectedStory].crop} চাষী</p>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-white/90 text-green-800">
                            {successStories[selectedStory].improvement}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-3 gap-8 items-center">
                        {/* Profile */}
                        <div className="text-center">
                          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="text-3xl">{successStories[selectedStory].avatar}</div>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800 mb-2">
                            {successStories[selectedStory].name}
                          </h3>
                          <div className="flex items-center justify-center space-x-2 text-slate-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span>{successStories[selectedStory].location}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {successStories[selectedStory].crop} চাষী
                          </Badge>
                        </div>

                        {/* Story */}
                        <div className="lg:col-span-2">
                          <div className="mb-6">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {successStories[selectedStory].improvement}
                            </div>
                            <p className="text-lg text-slate-600 leading-relaxed">
                              &ldquo;{successStories[selectedStory].story}&rdquo;
                            </p>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {successStories[selectedStory].metrics.yield}%
                              </div>
                              <div className="text-sm text-slate-600">ফলন বৃদ্ধি</div>
                            </div>
                            <div className="text-center p-4 bg-emerald-50 rounded-lg">
                              <div className="text-2xl font-bold text-emerald-600">
                                {successStories[selectedStory].metrics.income}%
                              </div>
                              <div className="text-sm text-slate-600">আয় বৃদ্ধি</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">
                                {successStories[selectedStory].metrics.satisfaction}%
                              </div>
                              <div className="text-sm text-slate-600">সন্তুষ্টি</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-center mt-8 space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStory((prev) => (prev - 1 + successStories.length) % successStories.length)}
                  className="px-6"
                >
                  পূর্ববর্তী
                </Button>
                <Button
                  onClick={() => setSelectedStory((prev) => (prev + 1) % successStories.length)}
                  className="px-6 bg-green-600 hover:bg-green-700"
                >
                  পরবর্তী
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Future Projections */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                <GradientText>ভবিষ্যতের লক্ষ্য</GradientText> ও পরিকল্পনা
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আগামী বছরগুলোতে আমাদের প্রত্যাশিত অগ্রগতি ও সম্প্রসারণ পরিকল্পনা
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {futureProjections.map((projection, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FloatingCard className="h-full relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                      <Image
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop&crop=center"
                        alt="Future technology"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="p-8 relative">
                      {/* Year Badge */}
                      <div className="absolute -top-3 -right-3 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {projection.year.slice(-2)}
                      </div>

                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-xl mb-4">
                          <Calendar className="w-7 h-7 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{projection.year}</h3>
                        <p className="text-green-600 font-semibold">{projection.title}</p>
                        
                        {/* Progress Timeline */}
                        <div className="mt-4 flex justify-center">
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`w-3 h-3 rounded-full ${
                                  step <= index + 1 ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Targets */}
                      <div className="space-y-4 mb-6">
                        {projection.targets.map((target, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-600">{target.label}</span>
                            <span className="font-bold text-green-600">
                              {target.value}{target.suffix}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Initiatives */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-800">মূল উদ্যোগসমূহ:</h4>
                        {projection.initiatives.map((initiative, i) => (
                          <div key={i} className="flex items-start space-x-2">
                            <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-slate-600">{initiative}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden">
          {/* Background Images */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-24 h-24 rounded-full overflow-hidden animate-float">
              <Image
                src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop&crop=center"
                alt="Growing crops"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute top-20 right-16 w-32 h-32 rounded-full overflow-hidden animate-float-delayed">
              <Image
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=250&h=250&fit=crop&crop=center"
                alt="Smart farming"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute bottom-16 left-1/4 w-28 h-28 rounded-full overflow-hidden animate-float">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop&crop=center"
                alt="Happy farmers"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute bottom-20 right-1/4 w-20 h-20 rounded-full overflow-hidden animate-float-delayed">
              <Image
                src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=180&h=180&fit=crop&crop=center"
                alt="Irrigation"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                আমাদের প্রভাবের অংশীদার হন
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                বাংলাদেশের কৃষি বিপ্লবে যোগ দিন এবং একটি টেকসই ভবিষ্যৎ গড়তে সহায়তা করুন
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto mb-8">
                <Button 
                  size="lg"
                  variant="secondary"
                  className="bg-white text-green-600 hover:bg-slate-100"
                >
                  আজই যোগ দিন
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-green-700 hover:bg-white hover:text-green-600"
                >
                  আরো জানুন
                </Button>
              </div>

              {/* Impact Stats in CTA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">15,000+</div>
                  <div className="text-sm opacity-80">কৃষক পরিবার</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">35%</div>
                  <div className="text-sm opacity-80">উৎপাদন বৃদ্ধি</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">50%</div>
                  <div className="text-sm opacity-80">আয় বৃদ্ধি</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm opacity-80">সন্তুষ্টি</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ImpactPage;
