'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  Droplets, 
  Search, 
  Store, 
  Smartphone,
  MessageSquare,
  TrendingUp,
  Shield
} from "lucide-react";

export default function FeatureHighlights() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: '1',
      title: { bn: 'AI পরামর্শ', en: 'AI Consultation' },
      description: { 
        bn: 'বাংলা ভাষায় কথা বলে তাৎক্ষণিক কৃষি পরামর্শ নিন। আপনার প্রশ্নের উত্তর পান মুহূর্তেই।',
        en: 'Get instant agricultural advice by speaking in Bangla. Get answers to your questions immediately.'
      },
      icon: Brain,
      color: 'from-blue-500 to-purple-500',
      benefits: [
        { bn: 'বাংলা ভয়েস কমান্ড', en: 'Bangla Voice Commands' },
        { bn: '২৪/৭ সহায়তা', en: '24/7 Support' },
        { bn: 'বিশেষজ্ঞ পরামর্শ', en: 'Expert Advice' }
      ],
      stats: { number: '10K+', label: { bn: 'প্রশ্নের উত্তর', en: 'Questions Answered' } }
    },
    {
      id: '2',
      title: { bn: 'স্মার্ট সেচ', en: 'Smart Irrigation' },
      description: { 
        bn: 'IoT সেন্সর ও AI এর সাহায্যে স্বয়ংক্রিয় সেচ ব্যবস্থা। পানির অপচয় রোধ করুন।',
        en: 'Automated irrigation system using IoT sensors and AI. Prevent water wastage.'
      },
      icon: Droplets,
      color: 'from-cyan-500 to-blue-500',
      benefits: [
        { bn: '৫০% পানি সাশ্রয়', en: '50% Water Savings' },
        { bn: 'স্বয়ংক্রিয় নিয়ন্ত্রণ', en: 'Auto Control' },
        { bn: 'মোবাইল অ্যালার্ট', en: 'Mobile Alerts' }
      ],
      stats: { number: '40%', label: { bn: 'খরচ কমান', en: 'Cost Reduction' } }
    },
    {
      id: '3',
      title: { bn: 'রোগ নির্ণয়', en: 'Disease Detection' },
      description: { 
        bn: 'ক্যামেরা ও ড্রোনের সাহায্যে ফসলের রোগ ও পোকার আক্রমণ প্রাথমিক পর্যায়ে সনাক্ত করুন।',
        en: 'Detect crop diseases and pest attacks early using cameras and drones.'
      },
      icon: Search,
      color: 'from-green-500 to-emerald-500',
      benefits: [
        { bn: '৯৫% নির্ভুলতা', en: '95% Accuracy' },
        { bn: 'তাৎক্ষণিক সনাক্তকরণ', en: 'Instant Detection' },
        { bn: 'চিকিৎসার পরামর্শ', en: 'Treatment Advice' }
      ],
      stats: { number: '85%', label: { bn: 'ক্ষতি প্রতিরোধ', en: 'Loss Prevention' } }
    },
    {
      id: '4',
      title: { bn: 'সরাসরি বাজার', en: 'Direct Market' },
      description: { 
        bn: 'মধ্যস্বত্বভোগী ছাড়া সরাসরি ক্রেতার সাথে যোগাযোগ। উচিত দামে ফসল বিক্রি করুন।',
        en: 'Connect directly with buyers without middlemen. Sell crops at fair prices.'
      },
      icon: Store,
      color: 'from-orange-500 to-red-500',
      benefits: [
        { bn: 'উচিত দাম', en: 'Fair Prices' },
        { bn: 'তাৎক্ষণিক পেমেন্ট', en: 'Instant Payment' },
        { bn: 'স্বচ্ছ লেনদেন', en: 'Transparent Deals' }
      ],
      stats: { number: '60%', label: { bn: 'বেশি লাভ', en: 'More Profit' } }
    },
    {
      id: '5',
      title: { bn: 'মোবাইল অ্যাপ', en: 'Mobile App' },
      description: { 
        bn: 'যেকোনো সময়, যেকোনো জায়গা থেকে সব সুবিধা ব্যবহার করুন মোবাইল অ্যাপের মাধ্যমে।',
        en: 'Access all features anytime, anywhere through the mobile app.'
      },
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500',
      benefits: [
        { bn: 'অফলাইন সাপোর্ট', en: 'Offline Support' },
        { bn: 'সহজ ইন্টারফেস', en: 'Easy Interface' },
        { bn: 'নিয়মিত আপডেট', en: 'Regular Updates' }
      ],
      stats: { number: '4.8★', label: { bn: 'রেটিং', en: 'Rating' } }
    },
    {
      id: '6',
      title: { bn: 'কমিউনিটি সাপোর্ট', en: 'Community Support' },
      description: { 
        bn: 'অভিজ্ঞ কৃষকদের সাথে যোগাযোগ করুন। জ্ঞান ও অভিজ্ঞতা ভাগাভাগি করুন।',
        en: 'Connect with experienced farmers. Share knowledge and experiences.'
      },
      icon: MessageSquare,
      color: 'from-teal-500 to-green-500',
      benefits: [
        { bn: 'অভিজ্ঞ কৃষক', en: 'Expert Farmers' },
        { bn: 'প্রশ্ন-উত্তর', en: 'Q&A Forum' },
        { bn: 'সফলতার গল্প', en: 'Success Stories' }
      ],
      stats: { number: '25K+', label: { bn: 'কৃষক সদস্য', en: 'Farmer Members' } }
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M20 20L60 20L60 60L20 60Z' stroke='%23000000' stroke-width='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '80px 80px'
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
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-all duration-300"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            {language === 'bn' ? 'আমাদের বিশেষ সুবিধাসমূহ' : 'Our Special Features'}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            {language === 'bn' 
              ? 'আধুনিক প্রযুক্তির সাহায্যে কৃষিকাজকে করুন আরও সহজ, লাভজনক ও টেকসই'
              : 'Make farming easier, more profitable and sustainable with modern technology'
            }
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{ scale: 1.03 }}
                className="group"
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div 
                        className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 5 }}
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <motion.div 
                        className="text-right"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredFeature === feature.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-2xl font-bold text-gray-900">
                          {feature.stats.number}
                        </div>
                        <div className="text-xs text-gray-600">
                          {language === 'bn' ? feature.stats.label.bn : feature.stats.label.en}
                        </div>
                      </motion.div>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-green-600 group-hover:to-blue-600 transition-all duration-300">
                      {language === 'bn' ? feature.title.bn : feature.title.en}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {language === 'bn' ? feature.description.bn : feature.description.en}
                    </p>
                    
                    {/* Benefits List */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: hoveredFeature === feature.id ? 1 : 0,
                        height: hoveredFeature === feature.id ? 'auto' : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <motion.div
                          key={benefitIndex}
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: hoveredFeature === feature.id ? 1 : 0,
                            x: hoveredFeature === feature.id ? 0 : -10
                          }}
                          transition={{ 
                            duration: 0.3, 
                            delay: benefitIndex * 0.1 
                          }}
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`} />
                          <span className="text-sm text-gray-600">
                            {language === 'bn' ? benefit.bn : benefit.en}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* Action Button */}
                    <motion.button
                      className={`mt-6 w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        hoveredFeature === feature.id
                          ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {language === 'bn' ? 'বিস্তারিত জানুন' : 'Learn More'}
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-2xl overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-8 lg:p-12 text-white text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full border-4 border-white"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full border-4 border-white"></div>
              </div>
              
              <div className="relative z-10">
                <motion.div
                  className="flex justify-center space-x-8 mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {[Brain, Droplets, Search, Store].map((Icon, index) => (
                    <motion.div
                      key={index}
                      className="text-white"
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [-5, 5, -5]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    >
                      <Icon className="w-12 h-12" />
                    </motion.div>
                  ))}
                </motion.div>
                
                <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                  {language === 'bn' 
                    ? 'আরও জানতে চান? আমাদের সাথে যোগাযোগ করুন' 
                    : 'Want to know more? Contact us'
                  }
                </h3>
                <p className="text-xl text-green-100 mb-8">
                  {language === 'bn'
                    ? 'বিনামূল্যে ডেমো নিন এবং দেখুন কিভাবে আপনার কৃষিকাজ হতে পারে আরও লাভজনক'
                    : 'Get a free demo and see how your farming can be more profitable'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {language === 'bn' ? 'বিনামূল্যে ডেমো নিন' : 'Get Free Demo'}
                  </motion.button>
                  <motion.button
                    className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
                  </motion.button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}