"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { 
    Save, Leaf, Users, Target, DollarSign, Info, CheckCircle, BarChart3, 
    Tractor, Wheat, Sun, Droplets, Download, Printer, RefreshCw, AlertCircle, 
    Eye, EyeOff, FileText, PieChart, Activity, TrendingDown, Award, Clock, 
    Calculator, Database, Shield, Bell, MapPin, Sprout, Hash 
} from 'lucide-react';

export default function EnhancedBengaliInfoForm() {
 
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        farmerName: '',
        location: '',
        cropType: '',
        farmingExperience: '',
        totalAmount: '',
        successfulResult: '',
        todaysWork: '',
        monthlyIncome: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

      const [isMounted, setIsMounted] = useState(false);

    // --- Effects ---
    useEffect(() => {
        // Pre-fill the farmer's name from the logged-in user's profile
        if (user) {
            setFormData(prev => ({ ...prev, farmerName: user.full_name || '' }));
        }
    }, [user]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

      if (!isMounted) {
        return null; 
    }
    // --- Form Logic ---
    const validateForm = () => {
        const newErrors = {};
        if (!formData.farmerName.trim()) newErrors.farmerName = 'কৃষকের নাম আবশ্যক';
        if (!formData.location.trim()) newErrors.location = 'এলাকা আবশ্যক';
        if (!formData.cropType) newErrors.cropType = 'ফসলের ধরন আবশ্যক';
        if (!formData.totalAmount.trim()) newErrors.totalAmount = 'মোট জমির পরিমাণ আবশ্যক';
        if (!formData.successfulResult.trim()) {
            newErrors.successfulResult = 'সফল ফসলের সংখ্যা আবশ্যক';
        } else if (isNaN(Number(formData.successfulResult))) {
            newErrors.successfulResult = 'সঠিক সংখ্যা লিখুন';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const showTempNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        if (!user) {
            showTempNotification("তথ্য সংরক্ষণ করতে অনুগ্রহ করে লগ ইন করুন।", "error");
            return;
        }

        setIsLoading(true);
        setIsSubmitted(false);

        try {
            await api.saveFarmData(formData);
            setIsSubmitted(true);
            showTempNotification("তথ্য সফলভাবে সংরক্ষিত হয়েছে!", "success");
        } catch (error) {
            console.error("Failed to save farm data:", error);
            const errorMessage = error.response?.data?.detail || "তথ্য সংরক্ষণে ব্যর্থ হয়েছে।";
            showTempNotification(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            farmerName: user?.full_name || '',
            location: '',
            cropType: '',
            farmingExperience: '',
            totalAmount: '',
            successfulResult: '',
            todaysWork: '',
            monthlyIncome: '',
        });
        setIsSubmitted(false);
        setErrors({});
    };
    
    // --- Animation Variants ---
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    };

    // --- Component JSX ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 relative">
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className={`fixed top-4 right-4 z-50 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center ${
                            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}
                    >
                        <CheckCircle className="w-6 h-6 mr-3" />
                        <span className="font-medium">{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                            <div className="flex items-center">
                                <BarChart3 className="w-8 h-8 mr-3" />
                                <div>
                                    <h2 className="text-2xl font-bold">কৃষি তথ্য ফর্ম</h2>
                                    <p className="text-green-100 text-sm">পেশাদার কৃষি ব্যবস্থাপনা</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="space-y-12">
                               
                                <motion.div variants={itemVariants} className="space-y-6">
                                    <h3 className="text-xl font-bold text-green-800 flex items-center border-b pb-2">
                                        <Users className="w-6 h-6 mr-3" />
                                        ব্যক্তিগত ও কৃষি পরিচিতি
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Farmer Name */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <Users className="w-4 h-4 mr-2" /> কৃষকের নাম *
                                          </label>
                                          <input
                                              type="text" name="farmerName" value={formData.farmerName} onChange={handleInputChange}
                                              placeholder="আপনার পূর্ণ নাম"
                                              className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl ${errors.farmerName ? 'border-red-400' : 'border-green-200'}`}
                                          />
                                          {errors.farmerName && <p className="text-red-500 text-sm">{errors.farmerName}</p>}
                                        </div>

                                        {/* Location */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <MapPin className="w-4 h-4 mr-2" /> এলাকা *
                                          </label>
                                          <input
                                              type="text" name="location" value={formData.location} onChange={handleInputChange}
                                              placeholder="গ্রাম/উপজেলা/জেলা"
                                              className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl ${errors.location ? 'border-red-400' : 'border-green-200'}`}
                                          />
                                          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                                        </div>

                                        {/* Crop Type */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <Sprout className="w-4 h-4 mr-2" /> ফসলের ধরন *
                                          </label>
                                          <select
                                              name="cropType" value={formData.cropType} onChange={handleInputChange}
                                              className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl ${errors.cropType ? 'border-red-400' : 'border-green-200'}`}
                                          >
                                              <option value="">নির্বাচন করুন</option>
                                              <option value="ধান">ধান</option>
                                              <option value="গম">গম</option>
                                              <option value="ভুট্টা">ভুট্টা</option>
                                              <option value="পাট">পাট</option>
                                              <option value="সবজি">সবজি</option>
                                              <option value="ফল">ফল</option>
                                          </select>
                                          {errors.cropType && <p className="text-red-500 text-sm">{errors.cropType}</p>}
                                        </div>

                                        {/* Farming Experience */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <Clock className="w-4 h-4 mr-2" /> কৃষি অভিজ্ঞতা
                                          </label>
                                          <select
                                              name="farmingExperience" value={formData.farmingExperience} onChange={handleInputChange}
                                              className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200"
                                          >
                                              <option value="">অভিজ্ঞতা নির্বাচন করুন</option>
                                              <option value="১-৫ বছর">১-৫ বছর</option>
                                              <option value="৬-১০ বছর">৬-১০ বছর</option>
                                              <option value="১১-২০ বছর">১১-২০ বছর</option>
                                              <option value="২০+ বছর">২০+ বছর</option>
                                          </select>
                                        </div>
                                    </div>
                                </motion.div>

                             
                                <motion.div variants={itemVariants} className="space-y-6">
                                    <h3 className="text-xl font-bold text-green-800 flex items-center border-b pb-2">
                                        <BarChart3 className="w-6 h-6 mr-3" />
                                        উৎপাদন ও আর্থিক তথ্য
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Total Amount (Land) */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <MapPin className="w-4 h-4 mr-2" /> মোট জমি *
                                          </label>
                                          <input
                                              type="text" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange}
                                              placeholder="যেমন: ২ বিঘা, ১.৫ একর"
                                              className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl ${errors.totalAmount ? 'border-red-400' : 'border-green-200'}`}
                                          />
                                          {errors.totalAmount && <p className="text-red-500 text-sm">{errors.totalAmount}</p>}
                                        </div>

                                        {/* Monthly Income */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <DollarSign className="w-4 h-4 mr-2" /> মাসিক আয় (৳)
                                          </label>
                                          <input
                                              type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleInputChange}
                                              placeholder="যেমন: ১৫০০০"
                                              className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200"
                                          />
                                        </div>

                                        {/* Successful Result (Crops) */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <CheckCircle className="w-4 h-4 mr-2" /> সফল ফসল *
                                          </label>
                                          <input
                                              type="number" name="successfulResult" value={formData.successfulResult} onChange={handleInputChange}
                                              placeholder="কতগুলি ফসল সফল হয়েছে"
                                              className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl ${errors.successfulResult ? 'border-red-400' : 'border-green-200'}`}
                                          />
                                          {errors.successfulResult && <p className="text-red-500 text-sm">{errors.successfulResult}</p>}
                                        </div>

                                        {/* Today's Work */}
                                        <div className="space-y-2">
                                          <label className="flex items-center text-green-800 font-medium">
                                              <Wheat className="w-4 h-4 mr-2" /> আজকের কাজ
                                          </label>
                                          <input
                                              type="number" name="todaysWork" value={formData.todaysWork} onChange={handleInputChange}
                                              placeholder="আজ কতগুলি কাজ সম্পন্ন হয়েছে"
                                              className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200"
                                          />
                                        </div>
                                    </div>
                                </motion.div>
                                
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 disabled:opacity-50"
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                    >
                                        {isLoading ? (
                                            <>
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><RefreshCw className="w-6 h-6" /></motion.div>
                                                <span>সংরক্ষণ করা হচ্ছে...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                <span>তথ্য সংরক্ষণ করুন</span>
                                            </>
                                        )}
                                    </motion.button>
                                    <motion.button
                                        onClick={resetForm}
                                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        <span>রিসেট করুন</span>
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}