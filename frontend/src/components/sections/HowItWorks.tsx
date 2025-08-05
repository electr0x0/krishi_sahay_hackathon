'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  CheckCircle, 
  ArrowRight, 
  Smartphone,
  MessageSquare,
  TrendingUp,
  Play,
  Download,
  Users
} from "lucide-react";

export default function HowItWorks() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: '1',
      step: 1,
      title: { bn: 'অ্যাপ ডাউনলোড ও নিবন্ধন', en: 'Download App & Register' },
      shortTitle: { bn: 'ডাউনলোড', en: 'Download' },
      description: { 
        bn: 'প্লে স্টোর থেকে কৃষি সহায় অ্যাপ ডাউনলোড করুন। সহজ নিবন্ধন প্রক্রিয়া সম্পন্ন করুন।',
        en: 'Download Krishi Sahay app from Play Store. Complete easy registration process.'
      },
      detailDescription: {
        bn: 'মাত্র ২ মিনিটে নিবন্ধন করুন। শুধু আপনার নাম, ফোন নম্বর ও এলাকার তথ্য দিন। আমরা আপনার গোপনীয়তা রক্ষা করি।',
        en: 'Register in just 2 minutes. Just provide your name, phone number and area information. We protect your privacy.'
      },
      icon: Download,
      color: 'from-blue-500 to-purple-500',
      features: [
        { bn: 'বিনামূল্যে ডাউনলোড', en: 'Free Download' },
        { bn: '২ মিনিটে নিবন্ধন', en: '2-Minute Registration' },
        { bn: 'নিরাপদ তথ্য', en: 'Secure Data' }
      ],
      time: '2 মিনিট'
    },
    {
      id: '2',
      step: 2,
      title: { bn: 'খামারের তথ্য যোগ করুন', en: 'Add Farm Information' },
      shortTitle: { bn: 'খামার সেটআপ', en: 'Farm Setup' },
      description: { 
        bn: 'আপনার খামারের আকার, ফসলের ধরন ও অবস্থান যোগ করুন। আমরা আপনার জন্য কাস্টমাইজড সেবা তৈরি করব।',
        en: 'Add your farm size, crop types and location. We will create customized services for you.'
      },
      detailDescription: {
        bn: 'খামারের বিস্তারিত তথ্য দিন। আমাদের এআই আপনার এলাকার আবহাওয়া, মাটির ধরন ও অন্যান্য বিষয় বিবেচনা করে ব্যক্তিগত পরামর্শ দেবে।',
        en: 'Provide detailed farm information. Our AI will consider your area\'s weather, soil type and other factors to give personalized advice.'
      },
      icon: Smartphone,
      color: 'from-green-500 to-emerald-500',
      features: [
        { bn: 'সহজ ইনপুট', en: 'Easy Input' },
        { bn: 'কাস্টমাইজড সেবা', en: 'Customized Service' },
        { bn: 'এলাকা ভিত্তিক পরামর্শ', en: 'Area-based Advice' }
      ],
      time: '৫ মিনিট'
    },
    {
      id: '3',
      step: 3,
      title: { bn: 'এআই সহায়তা ও পরামর্শ', en: 'AI Assistance & Advice' },
      shortTitle: { bn: 'এআই সাহায্য', en: 'AI Help' },
      description: { 
        bn: 'বাংলা ভাষায় কথা বলে সহায়তা নিন। রোগ নির্ণয়, সেচ, সার প্রয়োগের পরামর্শ পান।',
        en: 'Get help by speaking in Bangla. Get advice on disease diagnosis, irrigation, fertilizer application.'
      },
      detailDescription: {
        bn: 'যেকোনো সময় প্রশ্ন করুন। আমাদের এআই ২৪/৭ উপলব্ধ। ছবি তুলে ফসলের সমস্যা সনাক্ত করুন। তাৎক্ষণিক সমাধান পান।',
        en: 'Ask questions anytime. Our AI is available 24/7. Identify crop problems by taking photos. Get instant solutions.'
      },
      icon: MessageSquare,
      color: 'from-purple-500 to-pink-500',
      features: [
        { bn: 'বাংলা ভয়েস সাপোর্ট', en: 'Bangla Voice Support' },
        { bn: 'ছবি বিশ্লেষণ', en: 'Image Analysis' },
        { bn: '২৪/৭ সেবা', en: '24/7 Service' }
      ],
      time: 'যেকোনো সময়'
    },
    {
      id: '4',
      step: 4,
      title: { bn: 'ফসল বিক্রয় ও লাভ', en: 'Crop Sale & Profit' },
      shortTitle: { bn: 'বিক্রয়', en: 'Sales' },
      description: { 
        bn: 'সরাসরি ক্রেতার সাথে যোগাযোগ করুন। মধ্যস্বত্বভোগী ছাড়া উচিত দামে ফসল বিক্রি করুন।',
        en: 'Connect directly with buyers. Sell crops at fair prices without middlemen.'
      },
      detailDescription: {
        bn: 'আমাদের মার্কেটপ্লেসে আপনার ফসল লিস্ট করুন। সরাসরি পেমেন্ট পান। গুণগত মান অনুযায়ী সেরা দাম নিশ্চিত করি।',
        en: 'List your crops on our marketplace. Get direct payment. We ensure the best price according to quality.'
      },
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      features: [
        { bn: 'সরাসরি বিক্রয়', en: 'Direct Sales' },
        { bn: 'উচিত দাম', en: 'Fair Price' },
        { bn: 'তাৎক্ষণিক পেমেন্ট', en: 'Instant Payment' }
      ],
      time: 'ফসল তোলার পর'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  const currentStep = steps[activeStep];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Cpath d='M60 60L0 60L0 0L60 0Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '120px 120px'
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
              className="bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-all duration-300 shadow-md"
            >
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
          
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            variants={itemVariants}
          >
            {language === 'bn' ? 'কিভাবে কাজ করে' : 'How It Works'}
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            {language === 'bn' 
              ? 'মাত্র চারটি সহজ ধাপে শুরু করুন আপনার স্মার্ট কৃষি যাত্রা'
              : 'Start your smart farming journey in just four easy steps'
            }
          </motion.p>
        </motion.div>

        {/* Interactive Steps */}
        <div className="max-w-6xl mx-auto">
          {/* Step Navigation */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    activeStep === index
                      ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:scale-105'
                  }`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activeStep === index ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      activeStep === index ? 'text-white' : 'text-gray-600'
                    }`}>
                      {step.step}
                    </span>
                  </div>
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm sm:text-base">
                    {language === 'bn' ? step.shortTitle.bn : step.shortTitle.en}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Active Step Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Content Side */}
                <div className="p-8 lg:p-12">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${currentStep.color}`}>
                      <currentStep.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {language === 'bn' ? 'ধাপ' : 'Step'} {currentStep.step}
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {language === 'bn' ? currentStep.title.bn : currentStep.title.en}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {language === 'bn' ? currentStep.description.bn : currentStep.description.en}
                  </p>
                  
                  <p className="text-gray-700 mb-8 leading-relaxed">
                    {language === 'bn' ? currentStep.detailDescription.bn : currentStep.detailDescription.en}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {currentStep.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">
                          {language === 'bn' ? feature.bn : feature.en}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Time Badge */}
                  <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 mb-8">
                    <span>⏱️</span>
                    <span>{language === 'bn' ? 'সময় লাগবে:' : 'Time required:'} {currentStep.time}</span>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex space-x-4">
                    {activeStep > 0 && (
                      <button
                        onClick={() => setActiveStep(activeStep - 1)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300"
                      >
                        <span>{language === 'bn' ? 'আগের ধাপ' : 'Previous'}</span>
                      </button>
                    )}
                    
                    {activeStep < steps.length - 1 ? (
                      <button
                        onClick={() => setActiveStep(activeStep + 1)}
                        className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${currentStep.color} text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg`}
                      >
                        <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <Link href="/dashboard">
                        <button className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${currentStep.color} text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg`}>
                          <span>{language === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Visual Side */}
                <div className={`bg-gradient-to-br ${currentStep.color} p-8 lg:p-12 flex items-center justify-center relative overflow-hidden`}>
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
                    <currentStep.icon className="w-32 h-32 text-white mx-auto mb-6" />
                    
                    <h4 className="text-2xl font-bold text-white mb-4">
                      {language === 'bn' ? 'ধাপ' : 'Step'} {currentStep.step}
                    </h4>
                    
                    <p className="text-white/80 text-lg">
                      {language === 'bn' ? currentStep.shortTitle.bn : currentStep.shortTitle.en}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Success Stats */}
        <motion.div 
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[
            { 
              number: '10,000+', 
              label: { bn: 'সফল কৃষক', en: 'Successful Farmers' },
              icon: '👨‍🌾'
            },
            { 
              number: '5 মিনিট', 
              label: { bn: 'সেটআপ সময়', en: 'Setup Time' },
              icon: '⚡'
            },
            { 
              number: '৯৮%', 
              label: { bn: 'সন্তুষ্ট ব্যবহারকারী', en: 'Satisfied Users' },
              icon: '😊'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
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

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl max-w-3xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {language === 'bn' ? 'আজই শুরু করুন' : 'Start Today'}
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              {language === 'bn'
                ? 'হাজারো কৃষকের সাথে যোগ দিন এবং আপনার কৃষিকাজে নিয়ে আসুন প্রযুক্তির ছোঁয়া'
                : 'Join thousands of farmers and bring technology to your farming'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <motion.button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{language === 'bn' ? 'এখনই নিবন্ধন করুন' : 'Register Now'}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <motion.button 
                className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                <span>{language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Video'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}