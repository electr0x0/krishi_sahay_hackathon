'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import ServicesSection from "@/components/sections/ServicesSection";
import ServicesShowcase from "@/components/sections/ServicesShowcase";
import ServiceFeatureSection from "@/components/sections/ServiceFeatureSection";
import Footer from "@/components/sections/Footer";
import { FloatingCard, GradientText } from "@/components/ui/aceternity";
import ServiceQuickCard from "@/components/ui/ServiceQuickCard";
import { 
  ArrowRight, 
  CheckCircle2,
  Star,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Headphones,
  ServerCrash
} from "lucide-react";

// Enhanced Service Details Component
const ServiceDetailCard = ({ 
  title, 
  description, 
  features, 
  benefits, 
  pricing,
  imageUrl
}: {
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  pricing: string;
  imageUrl?: string;
}) => {
  return (
    <FloatingCard className="overflow-hidden">
      {/* Service Image */}
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
            বৈশিষ্ট্যসমূহ
          </h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            সুবিধাসমূহ
          </h4>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-slate-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-slate-500">মূল্য</span>
            <p className="text-2xl font-bold text-green-600">{pricing}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors duration-300 flex items-center"
          >
            শুরু করুন
            <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>
        </div>
      </div>
      </div>
    </FloatingCard>
  );
};

// Testimonial Component
const TestimonialCard = ({ 
  name, 
  location, 
  quote, 
  rating,
  avatar
}: {
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatar?: string;
}) => {
  return (
    <FloatingCard className="p-6">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, index) => (
          <Star key={index} className="w-4 h-4 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-slate-600 mb-4 italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 overflow-hidden">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
              {name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{name}</p>
          <p className="text-sm text-slate-500">{location}</p>
        </div>
      </div>
    </FloatingCard>
  );
};

export default function ServicesPage() {
  const detailedServices = [
    {
      title: "AI চ্যাটবট সহায়তা",
      description: "আমাদের উন্নত AI প্রযুক্তি ব্যবহার করে ২৪/৭ কৃষি পরামর্শ পান। বাংলা ভাষায় সহজ সমাধান।",
      features: [
        "২৪/৭ উপলব্ধতা",
        "বাংলা ভাষা সাপোর্ট",
        "রিয়েল-টাইম উত্তর",
        "ছবি বিশ্লেষণ সুবিধা"
      ],
      benefits: [
        "তাৎক্ষণিক সমস্যা সমাধান",
        "বিশেষজ্ঞ পরামর্শ",
        "সময় ও অর্থ সাশ্রয়",
        "সহজ ব্যবহার"
      ],
      pricing: "বিনামূল্যে",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&crop=center"
    },
    {
      title: "স্মার্ট কৃষি পরিকল্পনা",
      description: "আপনার জমির জন্য কাস্টমাইজড কৃষি পরিকল্পনা এবং ফসল ব্যবস্থাপনা সিস্টেম।",
      features: [
        "মৌসুমী পরিকল্পনা",
        "ফসল রোটেশন গাইড",
        "সেচ ব্যবস্থাপনা",
        "খরচ বিশ্লেষণ"
      ],
      benefits: [
        "উৎপাদনশীলতা বৃদ্ধি",
        "খরচ কমানো",
        "পরিবেশ বান্ধব চাষাবাদ",
        "বৈজ্ঞানিক পদ্ধতি"
      ],
      pricing: "৫০০ টাকা/মাস",
      imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop&crop=center"
    },
    {
      title: "বাজার তথ্য সেবা",
      description: "রিয়েল-টাইম বাজার দর, দামের প্রবণতা এবং সর্বোত্তম বিক্রয়ের সময় জানুন।",
      features: [
        "দৈনিক মূল্য আপডেট",
        "ট্রেন্ড বিশ্লেষণ",
        "বাজার পূর্বাভাস",
        "মোবাইল অ্যালার্ট"
      ],
      benefits: [
        "সর্বোচ্চ লাভ নিশ্চিত",
        "বাজার সম্পর্কে সচেতনতা",
        "বিক্রয়ের সঠিক সময়",
        "ক্ষতি এড়ানো"
      ],
      pricing: "৩০০ টাকা/মাস",
      imageUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop&crop=center"
    }
  ];

  const testimonials = [
    {
      name: "আব্দুল করিম",
      location: "রংপুর",
      quote: "এই অ্যাপের মাধ্যমে আমার ধানের উৎপাদন ৩০% বেড়েছে। AI চ্যাটবট খুবই সহায়ক।",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "ফাতেমা খাতুন",
      location: "কুমিল্লা",
      quote: "বাজারের দাম জানতে পারি তাৎক্ষণিক। এখন আর ক্ষতি হয় না।",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "মোহাম্মদ আলী",
      location: "যশোর",
      quote: "সবজি চাষে এই প্ল্যাটফর্মের পরামর্শ অমূল্য। সবার ব্যবহার করা উচিত।",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-20 bg-gradient-to-b from-green-50 to-white"
        >
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
                  <ServerCrash className="w-10 h-10 text-green-600" />
                </motion.div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
                  সম্পূর্ণ <GradientText>কৃষি সেবা</GradientText>
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  আধুনিক প্রযুক্তির সাহায্যে আপনার কৃষি কাজকে আরও দক্ষ, লাভজনক এবং টেকসই করুন। 
                  আমাদের বিশেষজ্ঞ দল ২৪/৭ আপনার সেবায় নিয়োজিত।
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300 flex items-center"
                  >
                    বিনামূল্যে শুরু করুন
                    <ArrowRight className="w-5 h-5 ml-2" />
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
              </div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=450&fit=crop&crop=center"
                    alt="Modern Agriculture Technology"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                  
                  {/* Floating stats cards */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-2xl font-bold text-green-600">১০,০০০+</div>
                    <div className="text-sm text-slate-600">সন্তুষ্ট কৃষক</div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-2xl font-bold text-blue-600">৯৯.৯%</div>
                    <div className="text-sm text-slate-600">সফল সমাধান</div>
                  </div>
                </div>

                {/* Background decorations */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-200 rounded-full -z-10 opacity-30" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-200 rounded-full -z-10 opacity-40" />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Main Services Section */}
        <ServicesSection />

        {/* Interactive Showcase */}
        <ServicesShowcase />

        {/* Feature Showcase with Images */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                আমাদের <GradientText>প্রযুক্তি</GradientText> দেখুন
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                কৃত্রিম বুদ্ধিমত্তা এবং আধুনিক প্রযুক্তির সাহায্যে কৃষি কাজকে আরও সহজ করুন
              </p>
            </motion.div>

            <div className="space-y-32">
              <ServiceFeatureSection
                title="স্মার্ট AI চ্যাটবট"
                description="আমাদের উন্নত কৃত্রিম বুদ্ধিমত্তা চালিত চ্যাটবট ২৤/৭ আপনার সেবায় নিয়োজিত। যেকোনো কৃষি সমস্যার তাৎক্ষণিক সমাধান পান বাংলা ভাষায়।"
                features={[
                  "বাংলায় প্রাকৃতিক ভাষা প্রক্রিয়াকরণ",
                  "ছবি আপলোড করে রোগ নির্ণয়",
                  "ভয়েস কমান্ড সাপোর্ট",
                  "২৪/৭ তাৎক্ষণিক উত্তর"
                ]}
                imageSrc="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=450&fit=crop&crop=center"
                imageAlt="AI Chatbot Interface"
              />

              <ServiceFeatureSection
                title="IoT সেন্সর নেটওয়ার্ক"
                description="স্মার্ট সেন্সরের মাধ্যমে আপনার জমির প্রতিটি তথ্য রিয়েল-টাইমে জানুন। মাটির আর্দ্রতা, pH লেভেল, তাপমাত্রা - সবকিছু নিয়ন্ত্রণে রাখুন।"
                features={[
                  "মাটির আর্দ্রতা ও pH মনিটরিং",
                  "আবহাওয়া ডেটা সংগ্রহ",
                  "স্বয়ংক্রিয় সেচ সিস্টেম",
                  "মোবাইল অ্যালার্ট সিস্টেম"
                ]}
                imageSrc="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=450&fit=crop&crop=center"
                imageAlt="IoT Sensors in Agriculture"
                reverse={true}
              />

              <ServiceFeatureSection
                title="বাজার বিশ্লেষণ ড্যাশবোর্ড"
                description="রিয়েল-টাইম বাজার দর, দামের প্রবণতা এবং পূর্বাভাস দেখুন একটি সুন্দর ড্যাশবোর্ডে। সঠিক সময়ে বিক্রয় করে সর্বোচ্চ লাভ নিশ্চিত করুন।"
                features={[
                  "লাইভ মার্কেট প্রাইস ট্র্যাকিং",
                  "দামের ট্রেন্ড বিশ্লেষণ",
                  "বিক্রয়ের সর্বোত্তম সময় পরামর্শ",
                  "স্থানীয় ও জাতীয় বাজার তুলনা"
                ]}
                imageSrc="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=450&fit=crop&crop=center"
                imageAlt="Market Analysis Dashboard"
              />
            </div>
          </div>
        </section>

        {/* Services Gallery Section */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                আমাদের সেবার <GradientText>চিত্রকলা</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                দেখুন কীভাবে আমাদের প্রযুক্তি কৃষকদের জীবনে ইতিবাচক পরিবর্তন এনেছে
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "স্মার্ট ফার্মিং",
                  description: "আধুনিক প্রযুক্তি দিয়ে চাষাবাদ",
                  image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=300&fit=crop&crop=center"
                },
                {
                  title: "ড্রোন মনিটরিং", 
                  description: "আকাশ থেকে ফসল পর্যবেক্ষণ",
                  image: "https://images.unsplash.com/photo-1569163139394-de4e7b43e4e3?w=400&h=300&fit=crop&crop=center"
                },
                {
                  title: "হাইড্রোপনিক চাষ",
                  description: "মাটি ছাড়াই ফসল উৎপাদন",
                  image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center"
                },
                {
                  title: "সৌর চালিত সেচ",
                  description: "পরিবেশ বান্ধব সেচ ব্যবস্থা",
                  image: "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop&crop=center"
                },
                {
                  title: "বায়োটেকনোলজি",
                  description: "জৈবপ্রযুক্তি দিয়ে ফসল উন্নয়ন",
                  image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop&crop=center"
                },
                {
                  title: "ডিজিটাল বাজার",
                  description: "অনলাইনে ফসল বিক্রয়",
                  image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop&crop=center"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <FloatingCard className="overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-white/90">{item.description}</p>
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Services */}
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
                বিস্তারিত সেবা <GradientText>পরিকল্পনা</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আপনার প্রয়োজন অনুযায়ী আমাদের সেবা প্যাকেজ বেছে নিন এবং 
                আপনার কৃষি ব্যবসায় নতুন মাত্রা যোগ করুন।
              </p>
            </motion.div>

            <div className="space-y-8">
              {detailedServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ServiceDetailCard {...service} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">১৫+</div>
                <div className="text-slate-600">সন্তুষ্ট কৃষক</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">৪৫%</div>
                <div className="text-slate-600">উৎপাদন বৃদ্ধি</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">৯৯.৯%</div>
                <div className="text-slate-600">আপটাইম</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-slate-800">২৪/৭</div>
                <div className="text-slate-600">সাপোর্ট</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                সাফল্যের <GradientText>গল্পগুলো</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আমাদের প্রযুক্তি ব্যবহার করে কৃষকরা কীভাবে তাদের জীবন পরিবর্তন করেছেন
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Before & After Showcase */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <FloatingCard className="overflow-hidden">
                  <div className="grid grid-cols-2 h-64">
                    <div className="relative bg-slate-200">
                      <Image
                        src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&h=256&fit=crop&crop=center"
                        alt="Traditional Farming"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-sm font-medium mb-1">আগে</div>
                          <div className="text-xl font-bold">৩০% কম উৎপাদন</div>
                        </div>
                      </div>
                    </div>
                    <div className="relative bg-green-200">
                      <Image
                        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=256&fit=crop&crop=center"
                        alt="Smart Farming"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-sm font-medium mb-1">এখন</div>
                          <div className="text-xl font-bold">৭০% বেশি উৎপাদন</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      উৎপাদনশীলতা বৃদ্ধি
                    </h3>
                    <p className="text-slate-600 text-sm">
                      স্মার্ট প্রযুক্তি ব্যবহারের মাধ্যমে কৃষকরা তাদের উৎপাদন দ্বিগুণেরও বেশি বৃদ্ধি করেছেন
                    </p>
                  </div>
                </FloatingCard>
              </motion.div>

              {/* Statistics */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">৮৫%</div>
                    <div className="text-slate-600">আয় বৃদ্ধি পেয়েছে</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">৯২%</div>
                    <div className="text-slate-600">ফসলের ক্ষতি কমেছে</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-800">৬৫%</div>
                    <div className="text-slate-600">সময় সাশ্রয় হয়েছে</div>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center">
                    আপনিও শুরু করুন
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
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
                কৃষকদের <GradientText>মতামত</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                হাজারো কৃষক আমাদের সেবায় সন্তুষ্ট। তাদের সাফল্যের গল্প শুনুন।
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <TestimonialCard {...testimonial} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-32 bg-slate-50">
          <div className="container  mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-800 mb-6">
                সাশ্রয়ী <GradientText>মূল্য পরিকল্পনা</GradientText>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                আপনার প্রয়োজন অনুযায়ী উপযুক্ত প্ল্যান বেছে নিন
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <ServiceQuickCard
                  title="বেসিক প্ল্যান"
                  description="শুরুর জন্য আদর্শ"
                  price="বিনামূল্যে"
                  features={[
                    "মৌলিক AI পরামর্শ",
                    "আবহাওয়া তথ্য",
                    "কমিউনিটি অ্যাক্সেস",
                    "মৌলিক ফসল গাইড"
                  ]}
                  ctaText="এখনই শুরু করুন"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <ServiceQuickCard
                  title="প্রিমিয়াম প্ল্যান"
                  description="সব ধরনের কৃষকের জন্য"
                  price="৫০০ টাকা"
                  features={[
                    "সব বেসিক ফিচার",
                    "বাজার দর বিশ্লেষণ",
                    "IoT সেন্সর সাপোর্ট",
                    "ব্যক্তিগত পরামর্শ",
                    "প্রিমিয়াম রিপোর্ট"
                  ]}
                  popular={true}
                  ctaText="প্রিমিয়াম নিন"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <ServiceQuickCard
                  title="এন্টারপ্রাইজ"
                  description="বৃহৎ কৃষি ব্যবসার জন্য"
                  price="২০০০ টাকা"
                  features={[
                    "সব প্রিমিয়াম ফিচার",
                    "কাস্টম সমাধান",
                    "ডেডিকেটেড সাপোর্ট",
                    "অ্যানালিটিক্স ড্যাশবোর্ড",
                    "API অ্যাক্সেস"
                  ]}
                  ctaText="যোগাযোগ করুন"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
