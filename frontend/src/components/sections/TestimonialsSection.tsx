'use client';

import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, User } from "lucide-react";

export default function TestimonialsSection() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: { bn: 'আবদুল করিম', en: 'Abdul Karim' },
      location: { bn: 'রংপুর, বাংলাদেশ', en: 'Rangpur, Bangladesh' },
      crop: { bn: 'ধান চাষি', en: 'Rice Farmer' },
      image: '👨‍🌾',
      rating: 5,
      testimonial: {
        bn: 'কৃষি সহায় ব্যবহার করে আমার ধানের ফলন ৪০% বৃদ্ধি পেয়েছে। এআই যে পরামর্শ দেয়, তা খুবই কার্যকর। এখন আর পোকার আক্রমণে ভয় নেই।',
        en: 'Using Krishi Sahay increased my rice yield by 40%. The AI recommendations are very effective. I no longer fear pest attacks.'
      },
      highlight: { bn: '৪০% ফলন বৃদ্ধি', en: '40% Yield Increase' }
    },
    {
      id: 2,
      name: { bn: 'রাহেলা খাতুন', en: 'Rahela Khatun' },
      location: { bn: 'যশোর, বাংলাদেশ', en: 'Jessore, Bangladesh' },
      crop: { bn: 'সবজি চাষি', en: 'Vegetable Farmer' },
      image: '👩‍🌾',
      rating: 5,
      testimonial: {
        bn: 'ড্রোনের সাহায্যে আমার টমেটো ক্ষেতের রোগ আগেই ধরা পড়েছে। সময়মতো চিকিৎসা করতে পেরেছি। এবার লস নেই বললেই চলে।',
        en: 'With drone help, diseases in my tomato field were detected early. I was able to treat them on time. This season, there are almost no losses.'
      },
      highlight: { bn: 'শূন্য ক্ষতি', en: 'Zero Loss' }
    },
    {
      id: 3,
      name: { bn: 'মোতাহার হোসেন', en: 'Motahar Hossain' },
      location: { bn: 'কুমিল্লা, বাংলাদেশ', en: 'Comilla, Bangladesh' },
      crop: { bn: 'আলু চাষি', en: 'Potato Farmer' },
      image: '👨‍🌾',
      rating: 5,
      testimonial: {
        bn: 'স্মার্ট সেচ ব্যবস্থা ব্যবহার করে পানির খরচ অর্ধেক হয়ে গেছে। আবহাওয়ার পূর্বাভাস পেয়ে সময়মতো সার দিতে পারি। লাভ অনেক বেড়েছে।',
        en: 'Smart irrigation system reduced water costs by half. Getting weather forecasts helps me apply fertilizer on time. Profits have increased significantly.'
      },
      highlight: { bn: '৫০% খরচ সাশ্রয়', en: '50% Cost Savings' }
    },
    {
      id: 4,
      name: { bn: 'সালমা বেগম', en: 'Salma Begum' },
      location: { bn: 'বগুড়া, বাংলাদেশ', en: 'Bogura, Bangladesh' },
      crop: { bn: 'ভুট্টা চাষি', en: 'Corn Farmer' },
      image: '👩‍🌾',
      rating: 5,
      testimonial: {
        bn: 'বাংলা ভাষায় কথা বলে সহায়তা নেওয়াটা খুবই সুবিধার। যখন যে সমস্যা হয়, সঙ্গে সঙ্গে সমাধান পাই। আর বাজারে সরাসরি বিক্রি করে ভাল দাম পাচ্ছি।',
        en: 'Getting help by speaking in Bangla is very convenient. I get immediate solutions whenever I have problems. Also, selling directly to the market gets me better prices.'
      },
      highlight: { bn: 'ভাল দাম', en: 'Better Prices' }
    },
    {
      id: 5,
      name: { bn: 'আনিসুর রহমান', en: 'Anisur Rahman' },
      location: { bn: 'সিলেট, বাংলাদেশ', en: 'Sylhet, Bangladesh' },
      crop: { bn: 'চা চাষি', en: 'Tea Farmer' },
      image: '👨‍🌾',
      rating: 5,
      testimonial: {
        bn: 'চা পাতার গুণগত মান বিশ্লেষণ করে এআই যে পরামর্শ দেয়, তা অসাধারণ। এখন আমার চায়ের দাম আগের চেয়ে অনেক বেশি পাচ্ছি।',
        en: 'The AI recommendations after analyzing tea leaf quality are amazing. Now I get much better prices for my tea than before.'
      },
      highlight: { bn: 'উন্নত গুণমান', en: 'Improved Quality' }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='m0 40 40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '40px 40px'
             }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-all duration-300 shadow-md"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            {language === 'bn' ? 'কৃষক ভাইদের মতামত' : 'What Farmers Say'}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'bn' 
              ? 'দেশের বিভিন্ন প্রান্তের কৃষকরা কী বলছেন কৃষি সহায় সম্পর্কে'
              : 'What farmers from different parts of the country say about Krishi Sahay'
            }
          </p>
        </motion.div>

        {/* Main Testimonial Display */}
        <div className="max-w-6xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Farmer Profile */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 lg:p-12 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-10">
                        <Quote className="w-32 h-32" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="text-center mb-6">
                          <div className="text-6xl mb-4">{current.image}</div>
                          <h3 className="text-2xl font-bold mb-2">
                            {language === 'bn' ? current.name.bn : current.name.en}
                          </h3>
                          <div className="flex items-center justify-center space-x-2 text-green-100 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                              {language === 'bn' ? current.location.bn : current.location.en}
                            </span>
                          </div>
                          <div className="flex items-center justify-center space-x-2 text-green-100">
                            <User className="w-4 h-4" />
                            <span className="text-sm">
                              {language === 'bn' ? current.crop.bn : current.crop.en}
                            </span>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex justify-center space-x-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 ${
                                i < current.rating 
                                  ? 'text-yellow-300 fill-current' 
                                  : 'text-green-200'
                              }`}
                            />
                          ))}
                        </div>
                        
                        {/* Highlight */}
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold">
                            {language === 'bn' ? current.highlight.bn : current.highlight.en}
                          </div>
                          <div className="text-sm text-green-100 mt-1">
                            {language === 'bn' ? 'ফলাফল' : 'Result'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Testimonial Content */}
                    <div className="lg:col-span-2 p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <Quote className="w-16 h-16 text-green-500 mb-6" />
                        <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
                          {language === 'bn' ? current.testimonial.bn : current.testimonial.en}
                        </blockquote>
                      </div>
                      
                      {/* Navigation */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {testimonials.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentTestimonial(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentTestimonial
                                  ? 'bg-green-500 scale-125'
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={prevTestimonial}
                            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-300"
                          >
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                          </button>
                          <button
                            onClick={nextTestimonial}
                            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-300"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Success Statistics */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[
            { 
              number: '১০,০০০+', 
              label: { bn: 'সন্তুষ্ট কৃষক', en: 'Happy Farmers' },
              icon: '😊'
            },
            { 
              number: '৯৮%', 
              label: { bn: 'সুপারিশ হার', en: 'Recommendation Rate' },
              icon: '👍'
            },
            { 
              number: '৫০%', 
              label: { bn: 'গড় লাভ বৃদ্ধি', en: 'Average Profit Increase' },
              icon: '📈'
            },
            { 
              number: '২৪/৭', 
              label: { bn: 'সহায়তা', en: 'Support' },
              icon: '🚀'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center bg-white/60 backdrop-blur-sm p-6 rounded-2xl hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium text-sm">
                {language === 'bn' ? stat.label.bn : stat.label.en}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-2xl overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-8 lg:p-12 text-white text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-4 border-white"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  {language === 'bn' 
                    ? 'আপনিও হয়ে উঠুন সফল কৃষক' 
                    : 'You Too Can Become a Successful Farmer'
                  }
                </h3>
                <p className="text-xl text-green-100 mb-8">
                  {language === 'bn'
                    ? 'আজই যোগ দিন হাজারো সফল কৃষকের সাথে'
                    : 'Join thousands of successful farmers today'
                  }
                </p>
                <motion.button
                  className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'bn' ? 'বিনামূল্যে শুরু করুন' : 'Start Free Now'}
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}