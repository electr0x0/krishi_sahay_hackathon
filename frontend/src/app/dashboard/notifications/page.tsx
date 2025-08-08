'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { BarChart3, MapPin, Sprout, Clock, DollarSign, CheckCircle, Wheat } from 'lucide-react';

// A small component for displaying a single piece of data in a card
const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null; // Don't show the row if there's no data
    return (
        <div className="flex items-start text-sm">
            <Icon className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-gray-500" />
            <div className="flex justify-between w-full">
                <span className="text-gray-600">{label}:</span>
                <span className="font-semibold text-gray-800 text-right">{value}</span>
            </div>
        </div>
    );
};

export default function MyDataPage() {
    const { user, loading: authLoading } = useAuth();
    const [farmData, setFarmData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Only fetch if authentication is resolved and a user exists
            if (!authLoading && user) {
                try {
                    const response = await api.getFarmData();
                    // Sort data by most recent first (assuming 'id' increments)
                    setFarmData((response || []).sort((a, b) => b.id - a.id));
                } catch (err) {
                    setError('আপনার ডেটা আনতে ব্যর্থ হয়েছে।');
                    console.error("Failed to fetch farm data:", err);
                } finally {
                    setIsLoading(false);
                }
            } else if (!authLoading && !user) {
                // If auth is resolved and there's no user, stop loading
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, authLoading]); // Re-run when user or auth status changes

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // --- Conditional Rendering ---
    if (isLoading || authLoading) {
        return <div className="p-8 text-center text-gray-600">আপনার ডেটা লোড হচ্ছে...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">ত্রুটি: {error}</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-gray-600">আপনার ডেটা দেখতে লগ ইন করুন।</div>;
    }

    if (farmData.length === 0) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">আমার কৃষি তথ্য</h1>
                <p className="text-gray-600">আপনি এখনও কোনো তথ্য সংরক্ষণ করেননি।</p>
            </div>
        );
    }
    
    // --- Main Display ---
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">আমার কৃষি তথ্য</h1>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {farmData.map((entry) => (
                    <motion.div
                        key={entry.id}
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                        <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                            <h2 className="text-lg font-bold text-green-800 truncate">{entry.farmerName}</h2>
                            <p className="text-sm text-gray-500">{entry.location}</p>
                        </div>
                        <div className="p-5 space-y-3">
                            <InfoRow icon={Sprout} label="ফসলের ধরন" value={entry.cropType} />
                            <InfoRow icon={Clock} label="অভিজ্ঞতা" value={entry.farmingExperience} />
                            <hr className="my-2"/>
                            <InfoRow icon={MapPin} label="মোট জমি" value={entry.totalAmount} />
                            <InfoRow icon={CheckCircle} label="সফল ফসল" value={entry.successfulResult} />
                            <InfoRow icon={Wheat} label="আজকের কাজ" value={entry.todaysWork} />
                            <InfoRow icon={DollarSign} label="মাসিক আয়" value={`৳${Number(entry.monthlyIncome || 0).toLocaleString()}`} />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}