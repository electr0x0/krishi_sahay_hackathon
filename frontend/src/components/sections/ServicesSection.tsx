'use client';

import { motion } from "framer-motion";
import { 
  Bot, 
  TrendingUp, 
  Users, 
  Zap,
  BarChart3,
  CloudRain,
  Cpu,
  MapPin,
  Clock,
  LucideIcon
} from "lucide-react";
import { FloatingCard, GradientText } from "@/components/ui/aceternity";

// Service Card Component
const ServiceCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features 
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl"
    >
      {/* Icon Container */}
      <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors duration-300">
        <Icon className="w-7 h-7 text-green-600" />
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 group-hover:text-green-700 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-slate-600 leading-relaxed">
          {description}
        </p>
        
        {/* Features List */}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-slate-600">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              {feature}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-green-50/5 to-green-50/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

// Stats Component
const StatCard = ({ 
  value, 
  label, 
  icon: Icon 
}: {
  value: string;
  label: string;
  icon: LucideIcon;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl p-6 text-center border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg"
    >
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-green-600" />
      </div>
      <div className="text-3xl font-bold text-slate-800 mb-2">{value}</div>
      <div className="text-slate-600 text-sm">{label}</div>
    </motion.div>
  );
};

const ServicesSection = () => {
  const services = [
    {
      icon: Bot,
      title: "স্মার্ট কৃষি সহায়ক",
      description: "AI চালিত চ্যাটবট যা ২৪/৭ কৃষি বিষয়ক পরামর্শ প্রদান করে। বাংলা ভাষায় সহজ সমাধান পান।",
      features: [
        "রিয়েল-টাইম ফসলের সমস্যা সমাধান",
        "রোগ ও পোকার চিকিৎসা পরামর্শ",
        "সার ও কীটনাশক ব্যবহারের নির্দেশনা",
        "বাংলা ভয়েস সাপোর্ট"
      ]
    },
    {
      icon: CloudRain,
      title: "আবহাওয়া ভিত্তিক পূর্ববাণী",
      description: "স্থানীয় আবহাওয়ার তথ্য এবং কৃষি কাজের জন্য উপযুক্ত সময়ের পরামর্শ পান।",
      features: [
        "৭ দিনের আবহাওয়া পূর্বাণী",
        "বপন ও কাটার সময় নির্ধারণ",
        "বৃষ্টি ও খরার সতর্কতা",
        "তাপমাত্রা ভিত্তিক পরামর্শ"
      ]
    },
    {
      icon: BarChart3,
      title: "বাজার মূল্য বিশ্লেষণ",
      description: "রিয়েল-টাইম ফসলের বাজার দর এবং দামের প্রবণতা বিশ্লেষণ করুন।",
      features: [
        "দৈনিক বাজার দর আপডেট",
        "দামের ট্রেন্ড বিশ্লেষণ",
        "বিক্রয়ের সর্বোত্তম সময় পরামর্শ",
        "স্থানীয় মার্কেট তুলনা"
      ]
    },
    {
      icon: Cpu,
      title: "IoT সেন্সর ইন্টিগ্রেশন",
      description: "স্মার্ট সেন্সরের মাধ্যমে মাটির আর্দ্রতা, pH, এবং পুষ্টির মাত্রা পর্যবেক্ষণ করুন।",
      features: [
        "মাটির আর্দ্রতা মনিটরিং",
        "pH লেভেল ট্র্যাকিং",
        "সেচের স্বয়ংক্রিয় সতর্কতা",
        "ডেটা ভিত্তিক সুপারিশ"
      ]
    },
    {
      icon: TrendingUp,
      title: "ফসল ব্যবস্থাপনা",
      description: "বীজ থেকে ফসল কাটা পর্যন্ত সম্পূর্ণ প্রক্রিয়ার ডিজিটাল রেকর্ড এবং পরিকল্পনা।",
      features: [
        "ফসলের জীবনচক্র ট্র্যাকিং",
        "খরচ ও আয়ের হিসাব",
        "কাজের সময়সূচী পরিকল্পনা",
        "ফলনের পূর্বাভাস"
      ]
    },
    {
      icon: Users,
      title: "কমিউনিটি প্ল্যাটফর্ম",
      description: "অন্যান্য কৃষকদের সাথে অভিজ্ঞতা ভাগাভাগি করুন এবং পরামর্শ নিন।",
      features: [
        "কৃষক কমিউনিটি ফোরাম",
        "অভিজ্ঞতা শেয়ারিং",
        "বিশেষজ্ঞদের পরামর্শ",
        "স্থানীয় গ্রুপ তৈরি"
      ]
    }
  ];

  const stats = [
    { value: "১০,০০০+", label: "সন্তুষ্ট কৃষক", icon: Users },
    { value: "৫০+", label: "জেলায় সেবা", icon: MapPin },
    { value: "৯৫%", label: "সমস্যার সমাধান", icon: TrendingUp },
    { value: "২৪/৭", label: "সহায়তা সেবা", icon: Clock }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number]
      }
    }
  };

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            আমাদের <GradientText>সেবাসমূহ</GradientText>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            আধুনিক প্রযুক্তি ব্যবহার করে কৃষকদের জন্য ব্যাপক সমাধান প্রদান করি। 
            স্মার্ট কৃষির মাধ্যমে আপনার ফসলের উৎপাদনশীলতা বৃদ্ধি করুন।
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants}>
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <FloatingCard className="p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">
              আমাদের সাফল্যের গল্প
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              হাজারো কৃষকের বিশ্বাস অর্জন করে আমরা বাংলাদেশের কৃষি খাতে 
              একটি বিপ্লব ঘটিয়ে চলেছি।
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </FloatingCard>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              আজই শুরু করুন স্মার্ট কৃষি যাত্রা
            </h3>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              বিনামূল্যে রেজিস্ট্রেশন করুন এবং আমাদের সকল সেবা ব্যবহার করে 
              আপনার কৃষি কাজকে আরও লাভজনক করুন।
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors duration-300"
            >
              এখনই যোগ দিন
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
