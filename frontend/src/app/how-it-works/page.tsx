'use client';

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/sections/Footer";
import { FloatingCard, GradientText, HoverEffect, Spotlight, BackgroundGradient, AnimatedCounter } from "@/components/ui/aceternity";
import { 
  ArrowRight, 
  CheckCircle2,
  Users,
  TrendingUp,
  Shield,
  Brain,
  Mic,
  Smartphone,
  Download,
  MessageSquare,
  Droplets,
  Camera,
  Satellite,
  BarChart3,
  WifiOff,
  Volume2,
  Eye,
  Settings,
  Globe,
  Target,
  Award,
  Lightbulb,
  Zap,
  Database,
  Cloud,
  Cpu,
  Network,
  PhoneCall,
  MapPin,
  Headphones
} from "lucide-react";

// Technical Architecture Component
const TechnicalArchitecture = () => {
  const architectures = [
    {
      title: "AI ও ML স্ট্যাক",
      description: "উন্নত কৃত্রিম বুদ্ধিমত্তা ও মেশিন লার্নিং সমাধান",
      technologies: [
        { name: "Llama-4 LLM", description: "Fine-tuned কৃষি পরামর্শের জন্য", icon: Brain, detail: "কৃষি ডেটা দিয়ে প্রশিক্ষিত বিশেষায়িত ভাষা মডেল" },
        { name: "Vision Transformer", description: "ফসলের রোগ সনাক্তকরণ", icon: Eye, detail: "উন্নত কম্পিউটার ভিশন প্রযুক্তি" },
        { name: "YOLOv11", description: "পোকামাকড় ও কীটপতঙ্গ শনাক্তকরণ", icon: Target, detail: "রিয়েল-টাইম অবজেক্ট ডিটেকশন" },
        { name: "RAG Integration", description: "Real-time ডেটা প্রসেসিং", icon: Zap, detail: "Retrieval-Augmented Generation সিস্টেম" }
      ],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-800"
    },
    {
      title: "ভয়েস প্রযুক্তি",
      description: "বাংলা ভাষায় কণ্ঠস্বর চালিত ইন্টারঅ্যাকশন",
      technologies: [
        { name: "Bangla STT", description: "কথা থেকে টেক্সট রূপান্তর", icon: Mic, detail: "উন্নত বাংলা স্পিচ-টু-টেক্সট সিস্টেম" },
        { name: "Google WaveNet TTS", description: "টেক্সট থেকে কথা", icon: Volume2, detail: "প্রাকৃতিক বাংলা কণ্ঠস্বর তৈরি" },
        { name: "Voice Navigation", description: "কণ্ঠস্বর চালিত নেভিগেশন", icon: PhoneCall, detail: "হ্যান্ডস-ফ্রি অ্যাপ নিয়ন্ত্রণ" },
        { name: "Audio Alerts", description: "শব্দ ভিত্তিক সতর্কতা", icon: Headphones, detail: "গুরুত্বপূর্ণ তথ্যের জন্য অডিও অ্যালার্ট" }
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800"
    },
    {
      title: "IoT ও সেন্সর নেটওয়ার্ক",
      description: "স্মার্ট রিসোর্স ম্যানেজমেন্ট সিস্টেম",
      technologies: [
        { name: "Soil Moisture Sensors", description: "মাটির আর্দ্রতা পরিমাপ", icon: Droplets, detail: "রিয়েল-টাইম মাটির অবস্থা মনিটরিং" },
        { name: "Weather APIs", description: "আবহাওয়া ডেটা ইন্টিগ্রেশন", icon: Globe, detail: "স্যাটেলাইট ও স্থানীয় আবহাওয়া তথ্য" },
        { name: "Satellite Integration", description: "উপগ্রহ ভিত্তিক তথ্য", icon: Satellite, detail: "NDVI ও ফসলের স্বাস্থ্য পর্যবেক্ষণ" },
        { name: "Automated Irrigation", description: "স্বয়ংক্রিয় সেচ ব্যবস্থা", icon: Settings, detail: "স্মার্ট ওয়াটার ম্যানেজমেন্ট সিস্টেম" }
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-800"
    },
    {
      title: "MCP মার্কেট প্ল্যাটফর্ম",
      description: "Model Context Protocol ভিত্তিক স্বচ্ছ বাজার",
      technologies: [
        { name: "DAM API Integration", description: "সরকারি বাজার ডেটা", icon: BarChart3, detail: "Department of Agricultural Marketing সংযোগ" },
        { name: "BARC Portal", description: "কৃষি গবেষণা তথ্য", icon: Award, detail: "Bangladesh Agricultural Research Council ডেটা" },
        { name: "Real-time Pricing", description: "তাৎক্ষণিক দাম আপডেট", icon: TrendingUp, detail: "লাইভ মার্কেট প্রাইস ট্র্যাকিং" },
        { name: "Direct Buyer Connect", description: "মধ্যস্বত্বভোগী মুক্ত বিক্রয়", icon: Users, detail: "সরাসরি ক্রেতা-বিক্রেতা সংযোগ" }
      ],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800"
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-emerald-50/30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            <GradientText>প্রযুক্তিগত</GradientText> আর্কিটেকচার
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            আমাদের প্ল্যাটফর্ম অত্যাধুনিক AI, IoT, এবং ভয়েস প্রযুক্তির সমন্বয়ে তৈরি। 
            জানুন কীভাবে এই প্রযুক্তিগুলো একসাথে কাজ করে।
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {architectures.map((arch, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <FloatingCard className="h-full overflow-hidden">
                {/* Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={
                      index === 0 ? "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=200&fit=crop&crop=center" :
                      index === 1 ? "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=600&h=200&fit=crop&crop=center" :
                      index === 2 ? "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=200&fit=crop&crop=center" :
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=200&fit=crop&crop=center"
                    }
                    alt={arch.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/60" />
                  
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-2">{arch.title}</h3>
                    <p className="text-sm opacity-90">{arch.description}</p>
                  </div>
                </div>

                {/* Technology Cards */}
                <div className="p-6">
                  <div className="space-y-4">
                    {arch.technologies.map((tech, techIndex) => {
                      const IconComponent = tech.icon;
                      return (
                        <div key={techIndex} className="group p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200 border border-slate-100">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-all duration-200">
                              <IconComponent className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800">{tech.name}</div>
                              <div className="text-sm text-slate-600 mb-1">{tech.description}</div>
                              <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {tech.detail}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>

        {/* Technology Integration Flow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <FloatingCard className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
              <GradientText>সিস্টেম ইন্টিগ্রেশন</GradientText> ফ্লো
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop&crop=center"
                    alt="Data Collection"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-700">ডেটা সংগ্রহ</div>
                <div className="text-xs text-slate-500 mt-1">IoT + APIs</div>
              </div>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=200&h=200&fit=crop&crop=center"
                    alt="AI Processing"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-700">AI প্রোসেসিং</div>
                <div className="text-xs text-slate-500 mt-1">Llama-4 + ML</div>
              </div>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center"
                    alt="Analysis"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-700">বিশ্লেষণ</div>
                <div className="text-xs text-slate-500 mt-1">Real-time</div>
              </div>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center"
                    alt="Recommendations"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-700">পরামর্শ</div>
                <div className="text-xs text-slate-500 mt-1">কৃষকদের কাছে</div>
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>
    </section>
  );
};

// Step-by-Step Process Component
const StepByStepProcess = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      id: 1,
      title: "অ্যাপ ডাউনলোড ও রেজিস্ট্রেশন",
      subtitle: "শুরুর পদক্ষেপ",
      description: "প্লে স্টোর থেকে কৃষি সহায় অ্যাপ ডাউনলোড করুন এবং সহজ রেজিস্ট্রেশন সম্পন্ন করুন।",
      details: [
        "মাত্র ২ মিনিটে রেজিস্ট্রেশন",
        "ফোন নম্বর ভেরিফিকেশন",
        "প্রাথমিক প্রোফাইল সেটআপ",
        "বিনামূল্যে অ্যাকাউন্ট তৈরি"
      ],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&crop=center",
      icon: Download,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: 2,
      title: "খামারের তথ্য যোগ করুন",
      subtitle: "ব্যক্তিগতকৃত সেবার জন্য",
      description: "আপনার জমির পরিমাণ, ফসলের ধরন, এবং অবস্থানের তথ্য দিয়ে AI কে প্রশিক্ষিত করুন।",
      details: [
        "জমির পরিমাণ ও ধরন নির্বাচন",
        "চাষাবাদের ফসল তালিকা",
        "ভৌগোলিক অবস্থান সেটআপ",
        "মৌসুমী পরিকল্পনা তৈরি"
      ],
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop&crop=center",
      icon: MapPin,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 3,
      title: "AI সহায়তা ব্যবহার করুন",
      subtitle: "স্মার্ট পরামর্শ পান",
      description: "বাংলায় কথা বলে বা টাইপ করে যেকোনো কৃষি সমস্যার সমাধান পান।",
      details: [
        "২৪/৭ AI চ্যাটবট সাপোর্ট",
        "ভয়েস কমান্ড সুবিধা",
        "ছবি আপলোড করে রোগ নির্ণয়",
        "তাৎক্ষণিক সমাধান ও পরামর্শ"
      ],
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop&crop=center",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      title: "স্মার্ট মনিটরিং",
      subtitle: "রিয়েল-টাইম ট্র্যাকিং",
      description: "IoT সেন্সর ও ড্রোন প্রযুক্তির মাধ্যমে আপনার ফসল পর্যবেক্ষণ করুন।",
      details: [
        "মাটির আর্দ্রতা পর্যবেক্ষণ",
        "আবহাওয়া ডেটা ট্র্যাকিং",
        "ড্রোন ভিত্তিক নিরীক্ষা",
        "স্বয়ংক্রিয় সতর্কতা সিস্টেম"
      ],
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop&crop=center",
      icon: Camera,
      color: "from-cyan-500 to-blue-500"
    },
    {
      id: 5,
      title: "বাজারে সংযোগ",
      subtitle: "সরাসরি বিক্রয়",
      description: "আমাদের MCP প্ল্যাটফর্মের মাধ্যমে সরাসরি ক্রেতার সাথে যোগাযোগ করুন।",
      details: [
        "রিয়েল-টাইম মার্কেট প্রাইস",
        "সরাসরি ক্রেতা সংযোগ",
        "মধ্যস্বত্বভোগী মুক্ত বিক্রয়",
        "ডিজিটাল পেমেন্ট সুবিধা"
      ],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&crop=center",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            <GradientText>ধাপে ধাপে</GradientText> কার্যপ্রণালী
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            মাত্র পাঁচটি সহজ ধাপে শুরু করুন আপনার স্মার্ট কৃষি যাত্রা
          </p>
        </motion.div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-12 overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => setActiveStep(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${
                    activeStep === index ? 'bg-green-600/80 text-white' : 'bg-slate-600/80 text-white'
                  }`}>
                    {step.id}
                  </div>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-bold">{step.subtitle}</div>
                  <div className="text-xs opacity-75">{step.title.substring(0, 20)}...</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Active Step Content */}
        <div className="max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: activeStep === index ? 1 : 0,
                y: activeStep === index ? 0 : 20
              }}
              transition={{ duration: 0.5 }}
              className={`${activeStep === index ? 'block' : 'hidden'}`}
            >
              <FloatingCard className="overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Content */}
                  <div className="p-8 lg:p-12">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} text-white mb-6`}>
                      <step.icon className="w-8 h-8" />
                    </div>
                    
                    <h3 className="text-3xl font-bold text-slate-800 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-slate-800 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                        মূল বৈশিষ্ট্যসমূহ:
                      </h4>
                      <ul className="space-y-3">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-slate-600">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`mt-8 px-8 py-4 bg-gradient-to-r ${step.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center`}
                    >
                      এই ধাপটি শুরু করুন
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.button>
                  </div>

                  {/* Image */}
                  <div className="relative lg:p-8">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent`} />
                      
                      {/* Step indicator overlay */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-sm font-medium text-slate-600">ধাপ {step.id}</div>
                        <div className="text-xs text-slate-500">{step.subtitle}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Connectivity & Accessibility Features
const ConnectivityFeatures = () => {
  const features = [
    {
      title: "অফলাইন অ্যাক্সেস",
      description: "ইন্টারনেট সংযোগ ছাড়াই গুরুত্বপূর্ণ তথ্য অ্যাক্সেস করুন",
      icon: WifiOff,
      details: [
        "স্থানীয় ডেটা স্টোরেজ",
        "অফলাইন পেস্ট সতর্কতা",
        "সেচ পরিকল্পনা সংরক্ষণ",
        "প্রয়োজনীয় পরামর্শ ক্যাশিং"
      ],
      color: "bg-red-50 text-red-800 border-red-200"
    },
    {
      title: "ভয়েস চালিত নেভিগেশন",
      description: "কণ্ঠস্বর দিয়ে অ্যাপ নিয়ন্ত্রণ করুন, স্ক্রিন স্পর্শের প্রয়োজন নেই",
      icon: Mic,
      details: [
        "বাংলা ভয়েস কমান্ড",
        "হ্যান্ডস-ফ্রি অপারেশন",
        "অডিও ফিডব্যাক",
        "নিরক্ষর কৃষকদের জন্য সহায়ক"
      ],
      color: "bg-blue-50 text-blue-800 border-blue-200"
    },
    {
      title: "পুরানো ফোন সাপোর্ট",
      description: "কম শক্তিশালী ডিভাইসেও মসৃণভাবে চলে",
      icon: Smartphone,
      details: [
        "অপ্টিমাইজড পারফরমেন্স",
        "কম ব্যান্ডউইথ ব্যবহার",
        "ব্যাটারি সাশ্রয়ী",
        "সব অ্যান্ড্রয়েড ভার্সন সাপোর্ট"
      ],
      color: "bg-green-50 text-green-800 border-green-200"
    },
    {
      title: "SMS অ্যালার্ট সিস্টেম",
      description: "গুরুত্বপূর্ণ তথ্যের জন্য SMS বার্তা পান",
      icon: MessageSquare,
      details: [
        "আপৎকালীন সতর্কতা",
        "আবহাওয়া সতর্কবাণী",
        "বাজার দরের আপডেট",
        "কোনো ইন্টারনেট প্রয়োজন নেই"
      ],
      color: "bg-purple-50 text-purple-800 border-purple-200"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            <GradientText>বিবিধ হার্ডওয়্যার</GradientText> ও সংযোগের জন্য ডিজাইন
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            আমাদের প্ল্যাটফর্ম সব ধরনের ফোন ও ইন্টারনেট সংযোগেই কাজ করে। 
            নিরক্ষর কৃষক থেকে প্রযুক্তি বিশেষজ্ঞ - সবার জন্য উপযুক্ত।
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <FloatingCard className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Header Image */}
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={
                      index === 0 ? "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=200&fit=crop&crop=center" :
                      index === 1 ? "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&h=200&fit=crop&crop=center" :
                      index === 2 ? "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&crop=center" :
                      "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=400&h=200&fit=crop&crop=center"
                    }
                    alt={feature.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-green-600/40" />
                  
                  <div className="absolute bottom-2 left-2">
                    <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-600">{detail}</span>
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
  );
};

// Data Sources and Integration
const DataIntegration = () => {
  const dataSources = [
    {
      category: "সরকারি ডেটা সোর্স",
      sources: [
        { name: "Department of Agricultural Marketing (DAM)", description: "বাজার দর ও ট্রেন্ড ডেটা", icon: BarChart3 },
        { name: "Bangladesh Agricultural Research Council (BARC)", description: "কৃষি গবেষণা ও প্রযুক্তি", icon: Award },
        { name: "বাংলাদেশ আবহাওয়া অধিদপ্তর", description: "আবহাওয়া ও জলবায়ু তথ্য", icon: Cloud },
        { name: "মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট", description: "মাটির গুণগত মান ডেটা", icon: Database }
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      category: "রিয়েল-টাইম API সংযোগ",
      sources: [
        { name: "Weather API Integration", description: "স্যাটেলাইট আবহাওয়া ডেটা", icon: Satellite },
        { name: "Market Price APIs", description: "লাইভ কৃষিপণ্যের দাম", icon: TrendingUp },
        { name: "IoT Sensor Network", description: "মাঠ পর্যায়ের সেন্সর ডেটা", icon: Network },
        { name: "Drone Imagery", description: "উপর থেকে ফসলের ছবি", icon: Camera }
      ],
      color: "from-blue-500 to-purple-500",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            <GradientText>ডেটা সোর্স</GradientText> ও ইন্টিগ্রেশন
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            আমরা সরকারি ডেটাবেস, রিয়েল-টাইম API, এবং IoT সেন্সর থেকে তথ্য সংগ্রহ করে 
            সর্বাধিক নির্ভুল ও আপডেট পরামর্শ প্রদান করি।
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {dataSources.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, x: categoryIndex === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
              viewport={{ once: true }}
            >
              <FloatingCard className="h-full overflow-hidden">
                {/* Header Image */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={
                      categoryIndex === 0 
                        ? "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=200&fit=crop&crop=center"
                        : "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&h=200&fit=crop&crop=center"
                    }
                    alt={category.category}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-80`} />
                  
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">
                      {category.category}
                    </h3>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid gap-4">
                    {category.sources.map((source, sourceIndex) => (
                      <motion.div 
                        key={sourceIndex}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 rounded-lg bg-slate-50 hover:bg-white border border-slate-100 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-white shadow-sm">
                            <source.icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-1">
                              {source.name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {source.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>

        {/* Integration Flow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <FloatingCard className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              <GradientText>ডেটা প্রোসেসিং</GradientText> ফ্লো
            </h3>
            
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-slate-700">ডেটা সংগ্রহ</div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-slate-400 mx-auto hidden md:block" />
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Cpu className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-slate-700">AI প্রোসেসিং</div>
              </div>
              
              <ArrowRight className="w-6 h-6 text-slate-400 mx-auto hidden md:block" />
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-sm font-medium text-slate-700">পরামর্শ তৈরি</div>
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>
    </section>
  );
};

// Success Metrics and Impact
const SuccessMetrics = () => {
  const metrics = [
    { 
      value: "৯২%", 
      label: "ফসলের ক্ষতি কমেছে", 
      icon: Shield,
      description: "আমাদের প্রাথমিক সতর্কতা সিস্টেমের মাধ্যমে",
      color: "from-green-500 to-emerald-500"
    },
    { 
      value: "৮৫%", 
      label: "আয় বৃদ্ধি পেয়েছে", 
      icon: TrendingUp,
      description: "সরাসরি বিক্রয় ও উন্নত চাষাবাদের মাধ্যমে",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      value: "৭৫%", 
      label: "জল সাশ্রয় হয়েছে", 
      icon: Droplets,
      description: "স্মার্ট সেচ ব্যবস্থাপনার মাধ্যমে",
      color: "from-cyan-500 to-blue-500"
    },
    { 
      value: "৯৮%", 
      label: "কৃষক সন্তুষ্ট", 
      icon: Users,
      description: "আমাদের সেবায় কৃষকদের সন্তুষ্টির হার",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            <GradientText>সাফল্যের</GradientText> পরিমাপ
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            আমাদের প্রযুক্তি ইতিমধ্যে হাজারো কৃষকের জীবনে ইতিবাচক প্রভাব ফেলেছে
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <BackgroundGradient className="rounded-[22px] p-1 bg-white">
                <FloatingCard className="p-8 m-0 border-0 bg-white">
                  {/* Icon with background image */}
                  <div className="relative w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden">
                    <Image
                      src={
                        index === 0 ? "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop&crop=center" :
                        index === 1 ? "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center" :
                        index === 2 ? "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop&crop=center" :
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=center"
                      }
                      alt={metric.label}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <metric.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-4xl font-bold text-slate-800 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-semibold text-slate-700 mb-3">
                    {metric.label}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {metric.description}
                  </p>
                </FloatingCard>
              </BackgroundGradient>
            </motion.div>
          ))}
        </div>

        {/* Additional Impact Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <FloatingCard className="p-6 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=200&fit=crop&crop=center"
                  alt="Farmers Helped"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-2">
                <AnimatedCounter value={15} suffix="K+" />
              </div>
              <div className="text-sm text-slate-600">কৃষক সাহায্য পেয়েছেন</div>
            </FloatingCard>

            <FloatingCard className="p-6 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=200&h=200&fit=crop&crop=center"
                  alt="Sensors Connected"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-emerald-600/80 flex items-center justify-center">
                  <Network className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-2">
                <AnimatedCounter value={500} suffix="+" />
              </div>
              <div className="text-sm text-slate-600">IoT সেন্সর সংযুক্ত</div>
            </FloatingCard>

            <FloatingCard className="p-6 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=200&fit=crop&crop=center"
                  alt="Acres Monitored"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-2">
                <AnimatedCounter value={25} suffix="K+" />
              </div>
              <div className="text-sm text-slate-600">একর জমি মনিটর করা হচ্ছে</div>
            </FloatingCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// AI Workflow Interactive Demo
const AIWorkflowDemo = () => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const workflows = [
    {
      id: 0,
      title: "রোগ নির্ণয় প্রক্রিয়া",
      subtitle: "Computer Vision + AI Analysis",
      description: "ফসলের ছবি তুলে রোগ ও সমস্যা সনাক্ত করুন",
      steps: [
        { step: "ছবি আপলোড", description: "ফসলের পাতা বা ফলের ছবি তুলুন", icon: Camera },
        { step: "Image Processing", description: "Vision Transformer দিয়ে ছবি বিশ্লেষণ", icon: Eye },
        { step: "AI Analysis", description: "YOLOv11 মডেল দিয়ে রোগ সনাক্তকরণ", icon: Brain },
        { step: "সমাধান প্রদান", description: "তাৎক্ষণিক চিকিৎসা ও পরামর্শ", icon: Lightbulb }
      ],
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&crop=center",
      color: "from-red-500 to-orange-500"
    },
    {
      id: 1,
      title: "স্মার্ট সেচ সিস্টেম", 
      subtitle: "IoT + Weather API Integration",
      description: "স্বয়ংক্রিয় সেচ ব্যবস্থাপনা ও জল সাশ্রয়",
      steps: [
        { step: "Sensor Reading", description: "মাটির আর্দ্রতা ও pH পরিমাপ", icon: Droplets },
        { step: "Weather Check", description: "আবহাওয়া API থেকে তথ্য সংগ্রহ", icon: Globe },
        { step: "AI Decision", description: "FastAPI backend দিয়ে সিদ্ধান্ত গ্রহণ", icon: Cpu },
        { step: "Auto Irrigation", description: "প্রয়োজন অনুযায়ী স্বয়ংক্রিয় সেচ", icon: Settings }
      ],
      image: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=600&h=400&fit=crop&crop=center",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "বাজার দর পূর্বাভাস",
      subtitle: "MCP + Llama-4 Prediction",
      description: "বাজার ট্রেন্ড বিশ্লেষণ ও বিক্রয়ের উপযুক্ত সময় নির্ধারণ",
      steps: [
        { step: "Data Collection", description: "DAM, BARC থেকে বাজার তথ্য সংগ্রহ", icon: Database },
        { step: "Trend Analysis", description: "ঐতিহাসিক ডেটা দিয়ে প্যাটার্ন বিশ্লেষণ", icon: BarChart3 },
        { step: "LLM Processing", description: "Llama-4 দিয়ে পূর্বাভাস তৈরি", icon: Brain },
        { step: "Selling Alert", description: "সর্বোত্তম বিক্রয়ের সময় সতর্কতা", icon: TrendingUp }
      ],
      image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&h=400&fit=crop&crop=center",
      color: "from-green-500 to-emerald-500"
    }
  ];

  // Auto-play functionality
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setActiveDemo(prev => (prev + 1) % workflows.length);
      }, 5000); // Change every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, workflows.length]);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-800 mb-6">
            <GradientText>AI কার্যপ্রণালী</GradientText> ডেমো
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            দেখুন কীভাবে আমাদের AI সিস্টেম বিভিন্ন কৃষি সমস্যার সমাধানে কাজ করে
          </p>
        </motion.div>

        {/* Demo Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-col items-center space-y-4">
            {/* Auto-play Toggle */}
            <motion.button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                isAutoPlay 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
              <span>{isAutoPlay ? 'অটো-প্লে চালু' : 'অটো-প্লে বন্ধ'}</span>
            </motion.button>
            
            {/* Tab Navigation */}
            <div className="flex space-x-4 overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                {workflows.map((workflow, index) => {
                  const TabIcon = workflow.steps[0].icon; // Use the first step's icon as the tab icon
                  return (
                    <motion.button
                      key={workflow.id}
                      onClick={() => {
                        setActiveDemo(index);
                        setIsAutoPlay(false); // Stop auto-play when user manually selects
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                        activeDemo === index
                          ? 'bg-green-600 text-white shadow-lg'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center relative ${
                          activeDemo === index 
                            ? 'bg-white/20' 
                            : 'bg-green-50 border border-green-200'
                        }`}>
                          <TabIcon className={`w-6 h-6 ${
                            activeDemo === index ? 'text-white' : 'text-green-600'
                          }`} />
                          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                            activeDemo === index 
                              ? 'bg-white text-green-600' 
                              : 'bg-green-600 text-white'
                          }`}>
                            {workflow.id + 1}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold">{workflow.title}</div>
                          <div className="text-xs opacity-75">{workflow.subtitle}</div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Active Workflow Demo */}
        <div className="max-w-6xl mx-auto">
          {workflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: activeDemo === index ? 1 : 0,
                y: activeDemo === index ? 0 : 20
              }}
              transition={{ duration: 0.5 }}
              className={`w-full ${activeDemo === index ? 'block' : 'hidden'}`}
            >
              <FloatingCard className="overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Image */}
                  <div className="relative lg:p-8">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                      <Image
                        src={workflow.image}
                        alt={workflow.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${workflow.color} bg-opacity-40`} />
                      
                      {/* Overlay Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-sm font-medium text-slate-600">AI Demo</div>
                      </div>

                      {/* Process Flow Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              {workflow.steps.map((_, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className={`w-2 h-2 rounded-full ${
                                    stepIndex <= 2 ? 'bg-green-500' : 'bg-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className="text-xs font-medium text-slate-600">
                              {workflow.steps.length} ধাপ
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Feature Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative aspect-[3/2] rounded-lg overflow-hidden shadow-md group cursor-pointer"
                      >
                        <Image
                          src={
                            workflow.id === 0 ? "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&h=200&fit=crop&crop=center" :
                            workflow.id === 1 ? "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=300&h=200&fit=crop&crop=center" :
                            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=300&h=200&fit=crop&crop=center"
                          }
                          alt={`${workflow.title} Input`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-white text-xs font-medium">ইনপুট ডেটা</div>
                          <div className="text-white/80 text-xs">
                            {workflow.id === 0 ? "পাতার ছবি" : workflow.id === 1 ? "সেন্সর ডেটা" : "বাজার তথ্য"}
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="relative aspect-[3/2] rounded-lg overflow-hidden shadow-md group cursor-pointer"
                      >
                        <Image
                          src={
                            workflow.id === 0 ? "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=300&h=200&fit=crop&crop=center" :
                            workflow.id === 1 ? "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop&crop=center" :
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop&crop=center"
                          }
                          alt={`${workflow.title} Output`}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-white text-xs font-medium">আউটপুট ফলাফল</div>
                          <div className="text-white/80 text-xs">
                            {workflow.id === 0 ? "রোগ নির্ণয়" : workflow.id === 1 ? "সেচ পরামর্শ" : "দাম পূর্বাভাস"}
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <Lightbulb className="w-3 h-3" />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12">
                    <motion.div 
                      className="flex items-center space-x-3 mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className={`w-14 h-14 bg-gradient-to-r ${workflow.color} rounded-2xl flex items-center justify-center`}>
                        {React.createElement(workflow.steps[0].icon, { 
                          className: "w-7 h-7 text-white" 
                        })}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          {workflow.title}
                        </h3>
                        <p className="text-sm text-slate-500">{workflow.subtitle}</p>
                      </div>
                    </motion.div>
                    
                    <motion.p 
                      className="text-lg text-slate-600 mb-8 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      {workflow.description}
                    </motion.p>

                    {/* Workflow Steps */}
                    <div className="space-y-4 mb-8">
                      {workflow.steps.map((step, stepIndex) => (
                        <motion.div
                          key={stepIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 + stepIndex * 0.1 }}
                          className="flex items-start space-x-4 p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200 group"
                        >
                          <div className={`w-12 h-12 bg-gradient-to-r ${workflow.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                            {React.createElement(step.icon, { className: "w-6 h-6" })}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="w-6 h-6 bg-slate-200 text-slate-600 rounded-full text-xs font-bold flex items-center justify-center">
                                {stepIndex + 1}
                              </span>
                              <div className="font-semibold text-slate-800">
                                {step.step}
                              </div>
                            </div>
                            <div className="text-sm text-slate-600 ml-8">
                              {step.description}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <motion.div 
                      className="flex flex-wrap gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 bg-gradient-to-r ${workflow.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center`}
                      >
                        ডেমো দেখুন
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        কাস্টমাইজ করুন
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          ))}
        </div>

        {/* AI Process Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <FloatingCard className="p-8 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                <GradientText>AI প্রক্রিয়া</GradientText> ফ্লো চার্ট
              </h3>
              
              {/* Main Flow Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center mb-12">
                {/* Hardware Layer (Field Deployment) */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                      <Camera className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">ইনপুট ডেটা</h4>
                    <p className="text-sm text-slate-600">ছবি/সেন্সর</p>
                    
                    {/* Sub-components */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <Droplets className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-green-800">সেন্সর</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <Satellite className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-green-800">স্যাটেলাইট</div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-green-600"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Communication Layer */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                      <Network className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">ডেটা ট্রান্সমিশন</h4>
                    <p className="text-sm text-slate-600">HTTP/Wi-Fi</p>
                    
                    {/* Connection indicator */}
                    <div className="mt-4 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <Globe className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <div className="text-xs text-emerald-800 font-medium">সংযোগ সক্রিয়</div>
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="text-emerald-600"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Processing & Intelligence Layer */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                      <Brain className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">AI প্রসেসিং</h4>
                    <p className="text-sm text-slate-600">Llama-4 + RAG</p>
                    
                    {/* Processing models */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <Eye className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-green-800">Vision</div>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Database className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <div className="text-xs text-emerald-800">LLM</div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow to next step */}
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="text-green-600"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* User Interface Layer */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                      <Lightbulb className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">4</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">ফলাফল ও পরামর্শ</h4>
                    <p className="text-sm text-slate-600">কৃষকদের কাছে</p>
                    
                    {/* Output channels */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Smartphone className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <div className="text-xs text-emerald-800">মোবাইল</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                        <Volume2 className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs text-green-800">ভয়েস</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Detailed Process Flow */}
              <div className="border-t border-slate-200 pt-8">
                <h4 className="text-lg font-semibold text-slate-800 mb-6 text-center">বিস্তারিত প্রক্রিয়া</h4>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Disease Detection Process */}
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">রোগ নির্ণয়</h5>
                        <p className="text-sm text-green-700">Computer Vision + AI</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">কম্পিউটার ভিশন দিয়ে পাতার ছবি থেকে রোগ চিহ্নিতকরণ</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        YOLOv11 Model Detection
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        Vision Transformer Analysis
                      </div>
                    </div>
                  </motion.div>

                  {/* Smart Irrigation */}
                  <motion.div 
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Droplets className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">স্মার্ট সেচ</h5>
                        <p className="text-sm text-emerald-700">IoT + Weather API</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">IoT সেন্সর ডেটা থেকে সেচের সর্বোত্তম সময় নির্ধারণ</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        Soil Moisture Monitoring
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Weather Pattern Analysis
                      </div>
                    </div>
                  </motion.div>

                  {/* Market Prediction */}
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800">বাজার পূর্বাভাস</h5>
                        <p className="text-sm text-green-700">MCP + Llama-4</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">ঐতিহাসিক ডেটা থেকে দামের ট্রেন্ড ও সেরা বিক্রয়ের সময়</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Historical Data Analysis
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                        Price Trend Prediction
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Technical Stack Info */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-300">
                    <Cpu className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-800">Hardware</div>
                    <div className="text-xs text-green-700">ESP32 + Raspberry Pi</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:shadow-md transition-shadow duration-300">
                    <Cloud className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-800">Backend</div>
                    <div className="text-xs text-emerald-700">FastAPI + Python</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-300">
                    <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-800">AI Models</div>
                    <div className="text-xs text-green-700">Llama-4 + RAG</div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:shadow-md transition-shadow duration-300">
                    <Database className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-800">Database</div>
                    <div className="text-xs text-emerald-700">ChromaDB Vector</div>
                  </div>
                </div>
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>
    </section>
  );
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative py-32 bg-slate-50 overflow-hidden"
        >
          {/* Spotlight Effect */}
          <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(34, 197, 94, 0.3)" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-8 lg:mx-0 mx-auto"
                >
                  <Lightbulb className="w-10 h-10 text-green-600" />
                </motion.div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
                  <GradientText>কীভাবে কাজ করে</GradientText> আমাদের AI প্ল্যাটফর্ম
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto lg:mx-0">
                  AI-চালিত ওয়েব প্ল্যাটফর্ম যা বাংলাদেশের কৃষি চ্যালেঞ্জ মোকাবেলায় 
                  রিয়েল-টাইম অন্তর্দৃষ্টি, রিসোর্স অপ্টিমাইজেশন, এবং সবার জন্য উন্মুক্ত অ্যাক্সেস প্রদান করে।
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300 inline-flex items-center"
                >
                  শুরু করুন আজই
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </div>

              {/* Hero Images Grid */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <BackgroundGradient className="rounded-[22px] p-1 bg-white">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {/* Smart Farming */}
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=300&fit=crop&crop=center"
                        alt="Smart Farming Technology"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-green-600/20" />
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs font-medium text-slate-700">Smart Farming</span>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=300&fit=crop&crop=center"
                        alt="AI Analysis"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-green-600/20" />
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs font-medium text-slate-700">AI Analysis</span>
                      </div>
                    </div>

                    {/* IoT Sensors */}
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=300&fit=crop&crop=center"
                        alt="IoT Sensors"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-green-600/20" />
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs font-medium text-slate-700">IoT Sensors</span>
                      </div>
                    </div>

                    {/* Market Platform */}
                    <div className="relative aspect-square rounded-xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop&crop=center"
                        alt="Market Platform"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-green-600/20" />
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs font-medium text-slate-700">Market Platform</span>
                      </div>
                    </div>
                  </div>
                </BackgroundGradient>

                {/* Floating stats cards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-lg border border-slate-200"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      <AnimatedCounter value={15000} suffix="+" />
                    </div>
                    <div className="text-sm text-slate-600">কৃষক</div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-slate-200"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">৯৮%</div>
                    <div className="text-sm text-slate-600">সন্তুষ্টি</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Key Features Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mt-20"
            >
              <HoverEffect
                items={[
                  {
                    title: "AI-চালিত পরামর্শ",
                    description: "Llama-4 LLM দিয়ে স্মার্ট কৃষি সমাধান",
                    icon: <Brain className="w-6 h-6 text-green-600" />,
                    value: "24/7"
                  },
                  {
                    title: "ভয়েস সাপোর্ট",
                    description: "বাংলায় কণ্ঠস্বর চালিত ইন্টারঅ্যাকশন",
                    icon: <Mic className="w-6 h-6 text-green-600" />,
                    value: "বাংলা"
                  },
                  {
                    title: "IoT মনিটরিং",
                    description: "রিয়েল-টাইম সেন্সর ডেটা ট্র্যাকিং",
                    icon: <Droplets className="w-6 h-6 text-green-600" />,
                    value: "লাইভ"
                  },
                  {
                    title: "ডিজিটাল বাজার",
                    description: "MCP প্ল্যাটফর্মে সরাসরি বিক্রয়",
                    icon: <TrendingUp className="w-6 h-6 text-green-600" />,
                    value: "সরাসরি"
                  }
                ]}
                className="grid-cols-2 lg:grid-cols-4"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Technical Architecture */}
        <TechnicalArchitecture />

        {/* Step by Step Process */}
        <StepByStepProcess />

        {/* AI Workflow Interactive Demo */}
        <AIWorkflowDemo />

        {/* Data Integration */}
        <DataIntegration />

        {/* Connectivity Features */}
        <ConnectivityFeatures />

        {/* Success Metrics */}
        <SuccessMetrics />

        {/* CTA Section */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <FloatingCard className="p-12">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                  আপনিও যোগ দিন <GradientText>স্মার্ট কৃষি</GradientText> বিপ্লবে
                </h2>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  হাজারো কৃষকের সাথে যোগ দিন এবং প্রযুক্তির শক্তিতে আপনার কৃষি ব্যবসাকে 
                  এগিয়ে নিয়ে যান।
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center"
                  >
                    বিনামূল্যে শুরু করুন
                    <Download className="w-5 h-5 ml-2" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors duration-300 flex items-center"
                  >
                    <Headphones className="w-5 h-5 mr-2" />
                    সাপোর্ট পান
                  </motion.button>
                </div>
              </FloatingCard>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
