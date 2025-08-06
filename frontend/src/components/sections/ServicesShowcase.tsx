'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause,
  Volume2,
  VolumeX
} from "lucide-react";
import { FloatingCard } from "@/components/ui/aceternity";

// Interactive Demo Component
const InteractiveDemo = ({ 
  title, 
  description, 
  videoSrc, 
  thumbnailSrc 
}: { 
  title: string; 
  description: string;
  videoSrc?: string;
  thumbnailSrc?: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSound, setHasSound] = useState(true);

  return (
    <FloatingCard className="p-6">
      <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        {thumbnailSrc && (
          <Image 
            src={thumbnailSrc} 
            alt={title}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        )}
        
        {/* Video Element */}
        {videoSrc && isPlaying ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted={!hasSound}
            loop
            onEnded={() => setIsPlaying(false)}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
        )}
        
        {/* Play/Pause Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative z-10 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-green-600" />
          ) : (
            <Play className="w-6 h-6 text-green-600 ml-1" />
          )}
        </motion.button>
        
        {/* Sound Toggle */}
        <button
          onClick={() => setHasSound(!hasSound)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
        >
          {hasSound ? (
            <Volume2 className="w-4 h-4 text-slate-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Demo Badge */}
        <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          লাইভ ডেমো
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
          02:30
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </FloatingCard>
  );
};

// FAQ Component
const FAQ = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FloatingCard className="p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex items-center justify-between"
      >
        <h3 className="text-lg font-semibold text-slate-800">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-5 h-5 text-green-600 transform rotate-90" />
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
        className="overflow-hidden"
      >
        <div className="pt-4 border-t border-slate-200 mt-4">
          <p className="text-slate-600">{answer}</p>
        </div>
      </motion.div>
    </FloatingCard>
  );
};

// Feature Comparison Component
const FeatureComparison = () => {
  const features = [
    { name: "২৪/৭ AI সাপোর্ট", free: true, premium: true },
    { name: "মৌলিক ফসল পরামর্শ", free: true, premium: true },
    { name: "আবহাওয়া আপডেট", free: true, premium: true },
    { name: "বাজার দর তথ্য", free: false, premium: true },
    { name: "IoT সেন্সর ইন্টিগ্রেশন", free: false, premium: true },
    { name: "ব্যক্তিগত কনসালটেশন", free: false, premium: true },
    { name: "প্রিমিয়াম রিপোর্ট", free: false, premium: true },
  ];

  return (
    <FloatingCard className="p-8">
      <h3 className="text-2xl font-bold text-center text-slate-800 mb-8">
        সেবা তুলনা
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4">বৈশিষ্ট্য</th>
              <th className="text-center py-3 px-4">
                <div className="bg-slate-100 rounded-lg py-2">
                  <div className="font-semibold">বিনামূল্যে</div>
                  <div className="text-sm text-slate-500">০ টাকা</div>
                </div>
              </th>
              <th className="text-center py-3 px-4">
                <div className="bg-green-100 rounded-lg py-2">
                  <div className="font-semibold text-green-700">প্রিমিয়াম</div>
                  <div className="text-sm text-green-600">৫০০ টাকা/মাস</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-slate-100">
                <td className="py-3 px-4 text-slate-700">{feature.name}</td>
                <td className="py-3 px-4 text-center">
                  {feature.free ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <div className="w-5 h-5 bg-slate-200 rounded-full mx-auto" />
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {feature.premium ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <div className="w-5 h-5 bg-slate-200 rounded-full mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FloatingCard>
  );
};

const ServicesShowcase = () => {
  const demos = [
    {
      title: "AI চ্যাটবট ডেমো",
      description: "দেখুন কীভাবে আমাদের AI সিস্টেম আপনার প্রশ্নের উত্তর দেয়",
      videoSrc: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      thumbnailSrc: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop&crop=center"
    },
    {
      title: "IoT সেন্সর মনিটরিং",
      description: "রিয়েল-টাইম মাটির তথ্য এবং সেচ ব্যবস্থাপনা",
      videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnailSrc: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop&crop=center"
    },
    {
      title: "বাজার দর ড্যাশবোর্ড", 
      description: "লাইভ বাজার দর এবং ট্রেন্ড বিশ্লেষণ",
      videoSrc: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailSrc: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop&crop=center"
    }
  ];

  const faqs = [
    {
      question: "কীভাবে রেজিস্ট্রেশন করব?",
      answer: "আপনি আমাদের ওয়েবসাইটে গিয়ে বিনামূল্যে অ্যাকাউন্ট তৈরি করতে পারেন। শুধুমাত্র আপনার মোবাইল নম্বর এবং একটি পাসওয়ার্ড দিয়েই শুরু করুন।"
    },
    {
      question: "প্রিমিয়াম সেবার মূল্য কত?",
      answer: "আমাদের প্রিমিয়াম প্ল্যান মাত্র ৫০০ টাকা প্রতি মাসে। এতে আপনি সকল উন্নত ফিচার এবং ব্যক্তিগত পরামর্শ সেবা পাবেন।"
    },
    {
      question: "IoT সেন্সর কীভাবে ইনস্টল করব?",
      answer: "আমাদের টেকনিশিয়ান টিম আপনার জমিতে বিনামূল্যে সেন্সর ইনস্টল করে দেবে। সেটআপের পর আপনি মোবাইল অ্যাপ দিয়ে সব তথ্য দেখতে পাবেন।"
    },
    {
      question: "বাংলা ভাষায় সাপোর্ট আছে কি?",
      answer: "হ্যাঁ, আমাদের সম্পূর্ণ সিস্টেম বাংলা ভাষায় উপলব্ধ। AI চ্যাটবট, ভয়েস কমান্ড এবং সাপোর্ট টিম সবই বাংলায় সেবা প্রদান করে।"
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Demo Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              লাইভ <span className="text-green-600">ডেমো</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              আমাদের প্রযুক্তি কীভাবে কাজ করে তা সরাসরি দেখুন এবং অনুভব করুন
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {demos.map((demo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <InteractiveDemo {...demo} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <FeatureComparison />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">
              সাধারণ <span className="text-green-600">প্রশ্নাবলী</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              কৃষকদের সবচেয়ে জিজ্ঞাসিত প্রশ্নের উত্তর
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FAQ {...faq} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
