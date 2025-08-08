"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { 
    Save, Leaf, Users, Target, DollarSign, Info, CheckCircle, BarChart3, 
    Tractor, Wheat, Sun, Droplets, Download, Printer, RefreshCw, AlertCircle, 
    Eye, EyeOff, FileText, PieChart, Activity, TrendingDown, Award, Clock, 
    Calculator, Database, Shield, Bell, MapPin, Sprout, Hash, Home, Building,
    Zap, Warehouse, Truck, Coins, Gauge, Calendar, ArrowRight, ArrowLeft
} from 'lucide-react';

export default function ComprehensiveFarmDataForm() {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [totalSteps] = useState(4);

    const [formData, setFormData] = useState({
        // Basic Information
        farmerName: '',
        farmName: '',
        description: '',
        farmType: '',
        
        // Location Information
        division: '',
        district: '',
        upazila: '',
        unionWard: '',
        village: '',
        detailedAddress: '',
        latitude: null,
        longitude: null,
        elevation: null,
        
        // Farm Size & Characteristics
        totalArea: 0,
        cultivableArea: 0,
        soilType: '',
        irrigationSource: '',
        waterSourceDistance: 0,
        
        // Infrastructure
        hasElectricity: false,
        hasStorage: false,
        hasProcessingUnit: false,
        transportationAccess: '',
        
        // Experience & Production
        farmingExperience: '',
        successfulCrops: 0,
        monthlyIncome: 0,
        yearlyProduction: 0,
        
        // Current Activity
        currentCrops: '',
        todaysWork: 0,
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    // Location data state
    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
    const [availableUpazilas, setAvailableUpazilas] = useState<string[]>([]);

    const [isMounted, setIsMounted] = useState(false);

    // --- Effects ---
    useEffect(() => {
        if (user) {
            setFormData(prev => ({ 
                ...prev, 
                farmerName: user.full_name || '',
                farmName: user.full_name ? `${user.full_name} খামার` : ''
            }));
        }
    }, [user]);

    useEffect(() => {
        setIsMounted(true);
        loadExistingData();
    }, []);

    const loadExistingData = async () => {
        try {
            const data = await api.getComprehensiveFarmData();
            if (data) {
                setFormData(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            // No existing data, that's fine
            console.log("No existing farm data found");
        }
    };

    if (!isMounted) {
        return null; 
    }

    // --- Form Logic ---
    const validateStep = (step) => {
        const newErrors = {};
        
        switch(step) {
            case 1: // Basic & Location Info
                if (!formData.farmerName.trim()) newErrors.farmerName = 'কৃষকের নাম আবশ্যক';
                if (!formData.farmName.trim()) newErrors.farmName = 'খামারের নাম আবশ্যক';
                if (!formData.farmType) newErrors.farmType = 'খামারের ধরন আবশ্যক';
                if (!formData.division.trim()) newErrors.division = 'বিভাগ আবশ্যক';
                if (!formData.district.trim()) newErrors.district = 'জেলা আবশ্যক';
                if (!formData.upazila.trim()) newErrors.upazila = 'উপজেলা আবশ্যক';
                break;
                
            case 2: // Farm Size & Characteristics
                if (!formData.totalArea || formData.totalArea <= 0) newErrors.totalArea = 'মোট জমির পরিমাণ আবশ্যক';
                break;
                
            case 3: // Infrastructure & Experience
                if (!formData.farmingExperience) newErrors.farmingExperience = 'কৃষি অভিজ্ঞতা আবশ্যক';
                break;
                
            case 4: // Production & Current Activity
                // Optional validations
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSliderChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle location changes to update dependent dropdowns
    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        
        // Simple location mapping without external import
        const bangladeshLocations = {
            "Dhaka": ["Dhaka", "Gazipur", "Kishoreganj", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Tangail"],
            "Chittagong": ["Chittagong", "Bandarban", "Brahmanbaria", "Chandpur", "Comilla", "Cox's Bazar", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
            "Rajshahi": ["Rajshahi", "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Sirajganj"],
            "Khulna": ["Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
            "Sylhet": ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
            "Barisal": ["Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
            "Rangpur": ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"],
            "Mymensingh": ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
        };
        
        if (name === 'division') {
            // Reset dependent fields when division changes
            setFormData(prev => ({ 
                ...prev, 
                division: value,
                district: '',
                upazila: ''
            }));
            // Update available districts
            const districts = bangladeshLocations[value] || [];
            setAvailableDistricts(districts);
            setAvailableUpazilas([]);
        } else if (name === 'district') {
            // Reset upazila when district changes
            setFormData(prev => ({ 
                ...prev, 
                district: value,
                upazila: ''
            }));
            // For simplicity, using district name + common upazila suffixes
            const commonUpazilas = [value + " Sadar", value + " Paurashava"];
            setAvailableUpazilas(commonUpazilas);
        } else {
            // Handle other location fields normally
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear errors for this field
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

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }
        
        if (!user) {
            showTempNotification("তথ্য সংরক্ষণ করতে অনুগ্রহ করে লগ ইন করুন।", "error");
            return;
        }

        setIsLoading(true);
        setIsSubmitted(false);

        try {
            await api.saveComprehensiveFarmData(formData);
            setIsSubmitted(true);
            showTempNotification("তথ্য সফলভাবে সংরক্ষিত হয়েছে!", "success");
        } catch (error) {
            console.error("Failed to save farm data:", error);
            const errorMessage = error.response?.data?.detail || "তথ্য সংরক্ষণে ব্যর্থ হয়েছে।";
            showTempNotification(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            farmerName: user?.full_name || '',
            farmName: user?.full_name ? `${user.full_name} খামার` : '',
            description: '',
            farmType: '',
            division: '',
            district: '',
            upazila: '',
            unionWard: '',
            village: '',
            detailedAddress: '',
            latitude: null,
            longitude: null,
            elevation: null,
            totalArea: 0,
            cultivableArea: 0,
            soilType: '',
            irrigationSource: '',
            waterSourceDistance: 0,
            hasElectricity: false,
            hasStorage: false,
            hasProcessingUnit: false,
            transportationAccess: '',
            farmingExperience: '',
            successfulCrops: 0,
            monthlyIncome: 0,
            yearlyProduction: 0,
            currentCrops: '',
            todaysWork: 0,
        });
        setCurrentStep(1);
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

    // Step render functions
    function renderBasicAndLocationInfo() {
        return (
            <motion.div variants={itemVariants} className="space-y-8">
                <h3 className="text-2xl font-bold text-green-800 flex items-center border-b pb-3">
                    <Users className="w-7 h-7 mr-3" />
                    মূল তথ্য ও ঠিকানা
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Farmer Name */}
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Users className="w-4 h-4 mr-2" /> কৃষকের নাম *
                        </label>
                        <input
                            type="text" 
                            name="farmerName" 
                            value={formData.farmerName} 
                            onChange={handleInputChange}
                            placeholder="আপনার পূর্ণ নাম"
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.farmerName ? 'border-red-400' : 'border-green-200 focus:border-green-500'}`}
                        />
                        {errors.farmerName && <p className="text-red-500 text-sm">{errors.farmerName}</p>}
                    </div>

                    {/* Farm Name */}
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Home className="w-4 h-4 mr-2" /> খামারের নাম *
                        </label>
                        <input
                            type="text" 
                            name="farmName" 
                            value={formData.farmName} 
                            onChange={handleInputChange}
                            placeholder="খামারের নাম"
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.farmName ? 'border-red-400' : 'border-green-200 focus:border-green-500'}`}
                        />
                        {errors.farmName && <p className="text-red-500 text-sm">{errors.farmName}</p>}
                    </div>

                    {/* Farm Type */}
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Sprout className="w-4 h-4 mr-2" /> খামারের ধরন *
                        </label>
                        <select
                            name="farmType" 
                            value={formData.farmType} 
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.farmType ? 'border-red-400' : 'border-green-200 focus:border-green-500'}`}
                        >
                            <option value="">নির্বাচন করুন</option>
                            <option value="crop">ফসল উৎপাদন</option>
                            <option value="livestock">পশুপালন</option>
                            <option value="mixed">মিশ্র খামার</option>
                            <option value="aquaculture">মৎস্য চাষ</option>
                        </select>
                        {errors.farmType && <p className="text-red-500 text-sm">{errors.farmType}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <FileText className="w-4 h-4 mr-2" /> খামারের বিবরণ
                        </label>
                        <textarea
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange}
                            placeholder="খামার সম্পর্কে সংক্ষিপ্ত বিবরণ"
                            rows={3}
                            className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        ঠিকানার তথ্য
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Division */}
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> বিভাগ *
                            </label>
                            <select
                                name="division" 
                                value={formData.division} 
                                onChange={handleLocationChange}
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.division ? 'border-red-400' : 'border-green-200 focus:border-green-500'}`}
                            >
                                <option value="">নির্বাচন করুন</option>
                                <option value="Dhaka">ঢাকা</option>
                                <option value="Chittagong">চট্টগ্রাম</option>
                                <option value="Rajshahi">রাজশাহী</option>
                                <option value="Khulna">খুলনা</option>
                                <option value="Barisal">বরিশাল</option>
                                <option value="Sylhet">সিলেট</option>
                                <option value="Rangpur">রংপুর</option>
                                <option value="Mymensingh">ময়মনসিংহ</option>
                            </select>
                            {errors.division && <p className="text-red-500 text-sm">{errors.division}</p>}
                        </div>

                        {/* District */}
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> জেলা *
                            </label>
                            <select
                                name="district" 
                                value={formData.district} 
                                onChange={handleLocationChange}
                                disabled={!formData.division}
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.district ? 'border-red-400' : 'border-green-200 focus:border-green-500'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            >
                                <option value="">প্রথমে বিভাগ নির্বাচন করুন</option>
                                {availableDistricts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                            {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
                        </div>

                        {/* Upazila */}
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> উপজেলা *
                            </label>
                            <select
                                name="upazila" 
                                value={formData.upazila} 
                                onChange={handleLocationChange}
                                disabled={!formData.district}
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.upazila ? 'border-red-400' : 'border-green-200 focus:border-green-500'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                            >
                                <option value="">প্রথমে জেলা নির্বাচন করুন</option>
                                {availableUpazilas.map(upazila => (
                                    <option key={upazila} value={upazila}>{upazila}</option>
                                ))}
                            </select>
                            {errors.upazila && <p className="text-red-500 text-sm">{errors.upazila}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* Union/Ward */}
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> ইউনিয়ন/ওয়ার্ড
                            </label>
                            <input
                                type="text" 
                                name="unionWard" 
                                value={formData.unionWard} 
                                onChange={handleInputChange}
                                placeholder="ইউনিয়ন/ওয়ার্ডের নাম"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                        </div>

                        {/* Village */}
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> গ্রাম
                            </label>
                            <input
                                type="text" 
                                name="village" 
                                value={formData.village} 
                                onChange={handleInputChange}
                                placeholder="গ্রামের নাম"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                        </div>

                        {/* Detailed Address */}
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> বিস্তারিত ঠিকানা
                            </label>
                            <input
                                type="text" 
                                name="detailedAddress" 
                                value={formData.detailedAddress} 
                                onChange={handleInputChange}
                                placeholder="বাড়ি নং, রাস্তা ইত্যাদি"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    function renderFarmCharacteristics() {
        return (
            <motion.div variants={itemVariants} className="space-y-8">
                <h3 className="text-2xl font-bold text-green-800 flex items-center border-b pb-3">
                    <BarChart3 className="w-7 h-7 mr-3" />
                    খামারের বৈশিষ্ট্য ও আকার
                </h3>
                
                {/* Area Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Target className="w-4 h-4 mr-2" /> মোট জমির পরিমাণ (একর) *
                        </label>
                        <div className="space-y-2">
                            <input
                                type="number" 
                                name="totalArea" 
                                value={formData.totalArea} 
                                onChange={handleInputChange}
                                step="0.1"
                                min="0"
                                placeholder="যেমন: 2.5"
                                className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.totalArea ? 'border-red-400' : 'border-green-200 focus:border-green-500'}`}
                            />
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    step="0.1"
                                    value={formData.totalArea}
                                    onChange={(e) => handleSliderChange('totalArea', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="text-sm text-gray-600 mt-1">০ - ২০ একর</div>
                            </div>
                        </div>
                        {errors.totalArea && <p className="text-red-500 text-sm">{errors.totalArea}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Target className="w-4 h-4 mr-2" /> চাষযোগ্য জমি (একর)
                        </label>
                        <div className="space-y-2">
                            <input
                                type="number" 
                                name="cultivableArea" 
                                value={formData.cultivableArea} 
                                onChange={handleInputChange}
                                step="0.1"
                                min="0"
                                max={formData.totalArea}
                                placeholder="যেমন: 2.0"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max={formData.totalArea || 20}
                                    step="0.1"
                                    value={formData.cultivableArea}
                                    onChange={(e) => handleSliderChange('cultivableArea', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="text-sm text-gray-600 mt-1">০ - {formData.totalArea || 20} একর</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Soil and Water */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Leaf className="w-4 h-4 mr-2" /> মাটির ধরন
                        </label>
                        <select
                            name="soilType" 
                            value={formData.soilType} 
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                        >
                            <option value="">নির্বাচন করুন</option>
                            <option value="clay">কাদামাটি</option>
                            <option value="loam">দোআঁশ মাটি</option>
                            <option value="sand">বালুমাটি</option>
                            <option value="silt">পলিমাটি</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Droplets className="w-4 h-4 mr-2" /> সেচের উৎস
                        </label>
                        <select
                            name="irrigationSource" 
                            value={formData.irrigationSource} 
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                        >
                            <option value="">নির্বাচন করুন</option>
                            <option value="river">নদী</option>
                            <option value="tube_well">নলকূপ</option>
                            <option value="pond">পুকুর</option>
                            <option value="rain_fed">বৃষ্টিনির্ভর</option>
                        </select>
                    </div>
                </div>

                {/* Water Source Distance */}
                <div className="space-y-2">
                    <label className="flex items-center text-green-800 font-medium">
                        <MapPin className="w-4 h-4 mr-2" /> পানির উৎসের দূরত্ব (মিটার)
                    </label>
                    <div className="space-y-2">
                        <input
                            type="number" 
                            name="waterSourceDistance" 
                            value={formData.waterSourceDistance} 
                            onChange={handleInputChange}
                            min="0"
                            placeholder="মিটারে দূরত্ব"
                            className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                        />
                        <div className="w-full">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="10"
                                value={formData.waterSourceDistance}
                                onChange={(e) => handleSliderChange('waterSourceDistance', parseInt(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="text-sm text-gray-600 mt-1">০ - ১০০০ মিটার</div>
                        </div>
                    </div>
                </div>

                {/* Geographic Information */}
                <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        ভৌগোলিক তথ্য (ঐচ্ছিক)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> অক্ষাংশ
                            </label>
                            <input
                                type="number" 
                                name="latitude" 
                                value={formData.latitude || ''} 
                                onChange={handleInputChange}
                                step="0.000001"
                                placeholder="যেমন: 23.7104"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <MapPin className="w-4 h-4 mr-2" /> দ্রাঘিমাংশ
                            </label>
                            <input
                                type="number" 
                                name="longitude" 
                                value={formData.longitude || ''} 
                                onChange={handleInputChange}
                                step="0.000001"
                                placeholder="যেমন: 90.3944"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center text-green-800 font-medium">
                                <Target className="w-4 h-4 mr-2" /> উচ্চতা (মিটার)
                            </label>
                            <input
                                type="number" 
                                name="elevation" 
                                value={formData.elevation || ''} 
                                onChange={handleInputChange}
                                placeholder="সমুদ্র পৃষ্ঠ থেকে উচ্চতা"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    function renderInfrastructureAndExperience() {
        return (
            <motion.div variants={itemVariants} className="space-y-8">
                <h3 className="text-2xl font-bold text-green-800 flex items-center border-b pb-3">
                    <Building className="w-7 h-7 mr-3" />
                    অবকাঠামো ও অভিজ্ঞতা
                </h3>
                
                {/* Infrastructure */}
                <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        খামারের সুবিধাসমূহ
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer p-4 bg-green-50 rounded-xl border-2 border-green-200 hover:bg-green-100 transition-colors">
                                <input
                                    type="checkbox" 
                                    name="hasElectricity" 
                                    checked={formData.hasElectricity} 
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                />
                                <Zap className="w-5 h-5 text-green-600" />
                                <span className="text-green-800 font-medium">বিদ্যুৎ সংযোগ আছে</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer p-4 bg-green-50 rounded-xl border-2 border-green-200 hover:bg-green-100 transition-colors">
                                <input
                                    type="checkbox" 
                                    name="hasStorage" 
                                    checked={formData.hasStorage} 
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                />
                                <Warehouse className="w-5 h-5 text-green-600" />
                                <span className="text-green-800 font-medium">গুদাম/সংরক্ষণাগার আছে</span>
                            </label>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer p-4 bg-green-50 rounded-xl border-2 border-green-200 hover:bg-green-100 transition-colors">
                                <input
                                    type="checkbox" 
                                    name="hasProcessingUnit" 
                                    checked={formData.hasProcessingUnit} 
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                />
                                <Tractor className="w-5 h-5 text-green-600" />
                                <span className="text-green-800 font-medium">প্রক্রিয়াকরণ ইউনিট আছে</span>
                            </label>

                            <div className="space-y-2">
                                <label className="flex items-center text-green-800 font-medium">
                                    <Truck className="w-4 h-4 mr-2" /> পরিবহন সুবিধা
                                </label>
                                <select
                                    name="transportationAccess" 
                                    value={formData.transportationAccess} 
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                                >
                                    <option value="">নির্বাচন করুন</option>
                                    <option value="good">খুব ভালো</option>
                                    <option value="moderate">মাঝারি</option>
                                    <option value="poor">দুর্বল</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Experience */}
                <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        কৃষি অভিজ্ঞতা
                    </h4>
                    
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Clock className="w-4 h-4 mr-2" /> কৃষিকাজের অভিজ্ঞতা *
                        </label>
                        <select
                            name="farmingExperience" 
                            value={formData.farmingExperience} 
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 bg-green-50 border-2 rounded-xl transition-colors ${errors.farmingExperience ? 'border-red-400' : 'border-green-200 focus:border-green-500'}`}
                        >
                            <option value="">অভিজ্ঞতা নির্বাচন করুন</option>
                            <option value="১-৫ বছর">১-৫ বছর</option>
                            <option value="৬-১০ বছর">৬-১০ বছর</option>
                            <option value="১১-২০ বছর">১১-২০ বছর</option>
                            <option value="২০+ বছর">২০+ বছর</option>
                        </select>
                        {errors.farmingExperience && <p className="text-red-500 text-sm">{errors.farmingExperience}</p>}
                    </div>
                </div>
            </motion.div>
        );
    }

    function renderProductionAndActivity() {
        return (
            <motion.div variants={itemVariants} className="space-y-8">
                <h3 className="text-2xl font-bold text-green-800 flex items-center border-b pb-3">
                    <BarChart3 className="w-7 h-7 mr-3" />
                    উৎপাদন ও বর্তমান কার্যক্রম
                </h3>
                
                {/* Production Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <CheckCircle className="w-4 h-4 mr-2" /> সফল ফসলের সংখ্যা
                        </label>
                        <div className="space-y-2">
                            <input
                                type="number" 
                                name="successfulCrops" 
                                value={formData.successfulCrops} 
                                onChange={handleInputChange}
                                min="0"
                                placeholder="কতগুলি ফসল সফল হয়েছে"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={formData.successfulCrops}
                                    onChange={(e) => handleSliderChange('successfulCrops', parseInt(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="text-sm text-gray-600 mt-1">০ - ২০টি ফসল</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Coins className="w-4 h-4 mr-2" /> মাসিক আয় (৳)
                        </label>
                        <div className="space-y-2">
                            <input
                                type="number" 
                                name="monthlyIncome" 
                                value={formData.monthlyIncome} 
                                onChange={handleInputChange}
                                min="0"
                                placeholder="যেমন: ১৫০০০"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="100000"
                                    step="1000"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => handleSliderChange('monthlyIncome', parseInt(e.target.value))}
                                    className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="text-sm text-gray-600 mt-1">০ - ১,০০,০০০ টাকা</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Gauge className="w-4 h-4 mr-2" /> বার্ষিক উৎপাদন (কেজি)
                        </label>
                        <div className="space-y-2">
                            <input
                                type="number" 
                                name="yearlyProduction" 
                                value={formData.yearlyProduction} 
                                onChange={handleInputChange}
                                min="0"
                                placeholder="বছরে মোট উৎপাদন"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={formData.yearlyProduction}
                                    onChange={(e) => handleSliderChange('yearlyProduction', parseInt(e.target.value))}
                                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="text-sm text-gray-600 mt-1">০ - ১০,০০০ কেজি</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center text-green-800 font-medium">
                            <Calendar className="w-4 h-4 mr-2" /> আজকের কাজ
                        </label>
                        <div className="space-y-2">
                            <input
                                type="number" 
                                name="todaysWork" 
                                value={formData.todaysWork} 
                                onChange={handleInputChange}
                                min="0"
                                placeholder="আজ কতগুলি কাজ সম্পন্ন হয়েছে"
                                className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                            />
                            <div className="w-full">
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={formData.todaysWork}
                                    onChange={(e) => handleSliderChange('todaysWork', parseInt(e.target.value))}
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="text-sm text-gray-600 mt-1">০ - ১০টি কাজ</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Crops */}
                <div className="space-y-2">
                    <label className="flex items-center text-green-800 font-medium">
                        <Sprout className="w-4 h-4 mr-2" /> বর্তমানে চাষ করা ফসল
                    </label>
                    <textarea
                        name="currentCrops" 
                        value={formData.currentCrops} 
                        onChange={handleInputChange}
                        placeholder="যেমন: ধান, গম, আলু, টমেটো"
                        rows={3}
                        className="w-full px-4 py-3 bg-green-50 border-2 rounded-xl border-green-200 focus:border-green-500 transition-colors"
                    />
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <PieChart className="w-5 h-5 mr-2" />
                        খামারের সারসংক্ষেপ
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">খামারের নাম:</span>
                            <span className="font-medium ml-2">{formData.farmName || 'অনুপস্থিত'}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">মোট জমি:</span>
                            <span className="font-medium ml-2">{formData.totalArea} একর</span>
                        </div>
                        <div>
                            <span className="text-gray-600">খামারের ধরন:</span>
                            <span className="font-medium ml-2">{formData.farmType || 'অনুপস্থিত'}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">মাসিক আয়:</span>
                            <span className="font-medium ml-2">৳{formData.monthlyIncome}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

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
                    className="max-w-5xl mx-auto"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <BarChart3 className="w-8 h-8 mr-3" />
                                    <div>
                                        <h2 className="text-2xl font-bold">সম্পূর্ণ কৃষি তথ্য ফর্ম</h2>
                                        <p className="text-green-100 text-sm">পেশাদার খামার ব্যবস্থাপনা সিস্টেম</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">{currentStep}/{totalSteps}</div>
                                    <div className="text-sm text-green-100">ধাপ</div>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4 bg-green-400/30 rounded-full h-2">
                                <div 
                                    className="bg-white rounded-full h-2 transition-all duration-300"
                                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-8">
                            {renderCurrentStep()}
                        </div>
                        
                        {/* Navigation */}
                        <div className="p-6 bg-gray-50 border-t flex justify-between">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                পূর্ববর্তী
                            </button>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={resetForm}
                                    className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors"
                                >
                                    <RefreshCw className="w-5 h-5 mr-2" />
                                    রিসেট
                                </button>
                                
                                {currentStep < totalSteps ? (
                                    <button
                                        onClick={nextStep}
                                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                                    >
                                        পরবর্তী
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                সংরক্ষণ করা হচ্ছে...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5 mr-2" />
                                                সংরক্ষণ করুন
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );

    function renderCurrentStep() {
        switch(currentStep) {
            case 1:
                return renderBasicAndLocationInfo();
            case 2:
                return renderFarmCharacteristics();
            case 3:
                return renderInfrastructureAndExperience();
            case 4:
                return renderProductionAndActivity();
            default:
                return null;
        }
    }
}
