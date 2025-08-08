'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import api from '@/lib/api.js';
import { AreaChart, BarChart, DollarSign, CheckSquare } from 'lucide-react';

const StatRow = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center text-gray-600">
            <Icon className={`w-5 h-5 mr-3 ${color}`} />
            <span>{label}</span>
        </div>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);

export default function QuickStatsCard() {
    const { user } = useAuth();
    const [farmData, setFarmData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const response = await api.getFarmData();
                    setFarmData(response || []); // Handle case where API returns null
                } catch (error) {
                    console.error("Failed to fetch farm data for stats:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Use useMemo to calculate stats only when farmData changes
    const stats = useMemo(() => {
        if (!farmData || farmData.length === 0) {
            return {
                totalLand: 'N/A',
                totalCrops: 0,
                totalTodaysWork: 0,
                totalMonthlyIncome: 0,
            };
        }

        // For total land, we'll show the value from the most recent entry as an example
        const latestEntry = farmData[farmData.length - 1];

        return {
            totalLand: latestEntry.total_amount || 'N/A',
            totalCrops: farmData.reduce((sum, entry) => sum + (entry.successful_result || 0), 0),
            totalTodaysWork: farmData.reduce((sum, entry) => sum + (entry.todays_work || 0), 0),
            totalMonthlyIncome: farmData.reduce((sum, entry) => sum + (entry.monthly_income || 0), 0),
        };
    }, [farmData]);

    if (isLoading) {
        return (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 h-52 animate-pulse">
                <div className="h-5 bg-gray-200 rounded-full w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-full w-full"></div>
            </div>
        );
    }
    
    return (
        <div className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">দ্রুত পরিসংখ্যান</h3>
            <div className="space-y-1">
                <StatRow 
                    icon={AreaChart} 
                    label="মোট জমি (সর্বশেষ)" 
                    value={stats.totalLand} 
                    color="text-green-600" 
                />
                <StatRow 
                    icon={BarChart} 
                    label="মোট সফল ফসল" 
                    value={`${stats.totalCrops}টি`} 
                    color="text-blue-600" 
                />
                <StatRow 
                    icon={CheckSquare} 
                    label="মোট কাজ সম্পন্ন" 
                    value={`${stats.totalTodaysWork}টি`} 
                    color="text-orange-600" 
                />
                <StatRow 
                    icon={DollarSign} 
                    label="মোট আয়" 
                    value={`৳${stats.totalMonthlyIncome.toLocaleString()}`} 
                    color="text-emerald-600" 
                />
            </div>
        </div>
    );
}