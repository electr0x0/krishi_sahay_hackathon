'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  Sun, 
  Sprout,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

interface SensorData {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  light_intensity: number;
  water_level: number;
  timestamp: string;
}

interface AIInsight {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  message: string;
  recommendations: string[];
}

const IoTSensorCard = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateLightIntensity = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return Math.random() * 450 + 50;
    if (hour >= 7 && hour < 10) return Math.random() * 9500 + 500;
    if (hour >= 10 && hour < 14) return Math.random() * 40000 + 10000;
    if (hour >= 14 && hour < 17) return Math.random() * 15000 + 5000;
    if (hour >= 17 && hour < 19) return Math.random() * 4500 + 500;
    return Math.random() * 50;
  };

  const generateAIInsight = (data: SensorData): AIInsight => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
    let criticalCount = 0;
    let warningCount = 0;

    // Temperature analysis
    if (data.temperature > 35) {
      issues.push('উচ্চ তাপমাত্রা');
      recommendations.push('ফসলে পানি দিন এবং ছায়া প্রদান করুন');
      warningCount++;
    } else if (data.temperature < 15) {
      issues.push('নিম্ন তাপমাত্রা');
      recommendations.push('ফসল সুরক্ষার ব্যবস্থা নিন');
      warningCount++;
    }

    // Soil moisture analysis
    if (data.soil_moisture < 30) {
      issues.push('মাটি শুষ্ক');
      recommendations.push('দ্রুত সেচ দিন - মাটিতে পানির ঘাটতি রয়েছে');
      criticalCount++;
    } else if (data.soil_moisture > 70) {
      issues.push('অতিরিক্ত আর্দ্রতা');
      recommendations.push('সেচ বন্ধ রাখুন - মাটিতে পানি বেশি');
      warningCount++;
    }

    // Water level analysis
    if (data.water_level < 20) {
      issues.push('পানির স্তর কম');
      recommendations.push('পানির ট্যাংক পূর্ণ করুন');
      criticalCount++;
    }

    // Humidity analysis
    if (data.humidity < 40) {
      issues.push('কম আর্দ্রতা');
      recommendations.push('বাতাসে আর্দ্রতা বাড়াতে স্প্রে করুন');
      warningCount++;
    } else if (data.humidity > 85) {
      issues.push('উচ্চ আর্দ্রতা');
      recommendations.push('বায়ুচলাচল বাড়ান - ছত্রাকের ঝুঁকি');
      warningCount++;
    }

    // Determine overall status
    if (criticalCount > 0) {
      status = 'critical';
    } else if (warningCount > 0) {
      status = 'warning';
    } else if (issues.length === 0) {
      status = 'excellent';
    } else {
      status = 'good';
    }

    // Combined analysis for optimal message
    let message = '';
    if (status === 'excellent') {
      message = '🌟 খামারের সকল সেন্সর ডেটা স্বাভাবিক! পরিবেশ ফসল চাষের জন্য আদর্শ।';
    } else if (status === 'good') {
      message = '✅ খামারের অবস্থা ভাল। কিছু ছোটখাটো সমন্বয় প্রয়োজন।';
    } else if (status === 'warning') {
      message = `⚠️ সতর্কতা: ${issues.join(', ')} সনাক্ত করা হয়েছে।`;
    } else {
      message = `🚨 জরুরি পদক্ষেপ প্রয়োজন: ${issues.join(', ')}!`;
    }

    if (recommendations.length === 0) {
      recommendations.push('বর্তমান অবস্থা বজায় রাখুন');
      recommendations.push('নিয়মিত সেন্সর ডেটা পর্যবেক্ষণ করুন');
    }

    return { status, message, recommendations };
  };

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/iot/get-latest-data');
        const data = response.data;

        const transformedData: SensorData = {
          temperature: data.temperature_c || 0,
          humidity: data.humidity_percent || 0,
          soil_moisture: data.soil_moisture_percent || 0,
          water_level: data.water_level_percent || 0,
          light_intensity: data.light_intensity || calculateLightIntensity(),
          timestamp: data.timestamp || new Date().toISOString()
        };

        setSensorData(transformedData);
        setAiInsight(generateAIInsight(transformedData));
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        // Use default data
        const defaultData: SensorData = {
          temperature: 28,
          humidity: 65,
          soil_moisture: 45,
          water_level: 0,
          light_intensity: calculateLightIntensity(),
          timestamp: new Date().toISOString()
        };
        setSensorData(defaultData);
        setAiInsight(generateAIInsight(defaultData));
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSensorStatus = (value: number, min: number, max: number) => {
    if (value >= min && value <= max) return 'normal';
    if (value < min) return 'low';
    return 'high';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
      case 'good': return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200';
      case 'warning': return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200';
      case 'critical': return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-800">IoT সেন্সর ডেটা</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>লাইভ</span>
        </div>
      </div>

      {/* Sensor Grid - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Temperature */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-red-600" />
            <span className="text-xs font-medium text-gray-700">তাপমাত্রা</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {sensorData?.temperature.toFixed(1)}°C
          </div>
          <div className={`mt-1.5 text-xs px-1.5 py-0.5 rounded-full inline-block ${getStatusColor(getSensorStatus(sensorData?.temperature || 0, 20, 35))}`}>
            {getSensorStatus(sensorData?.temperature || 0, 20, 35) === 'normal' ? '✓' : '!'}
          </div>
        </motion.div>

        {/* Humidity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">আর্দ্রতা</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {sensorData?.humidity.toFixed(1)}%
          </div>
          <div className={`mt-1.5 text-xs px-1.5 py-0.5 rounded-full inline-block ${getStatusColor(getSensorStatus(sensorData?.humidity || 0, 40, 80))}`}>
            {getSensorStatus(sensorData?.humidity || 0, 40, 80) === 'normal' ? '✓' : '!'}
          </div>
        </motion.div>

        {/* Soil Moisture */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sprout className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-medium text-gray-700">মাটির আর্দ্রতা</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {sensorData?.soil_moisture.toFixed(1)}%
          </div>
          <div className={`mt-1.5 text-xs px-1.5 py-0.5 rounded-full inline-block ${getStatusColor(getSensorStatus(sensorData?.soil_moisture || 0, 30, 70))}`}>
            {getSensorStatus(sensorData?.soil_moisture || 0, 30, 70) === 'normal' ? '✓' : '!'}
          </div>
        </motion.div>

        {/* Water Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-3 border border-cyan-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-xs font-medium text-gray-700">পানির স্তর</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {sensorData?.water_level.toFixed(1)}%
          </div>
          <div className={`mt-1.5 text-xs px-1.5 py-0.5 rounded-full inline-block ${getStatusColor(getSensorStatus(sensorData?.water_level || 0, 20, 100))}`}>
            {getSensorStatus(sensorData?.water_level || 0, 20, 100) === 'normal' ? '✓' : '!'}
          </div>
        </motion.div>

        {/* Light Intensity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-100"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sun className="w-3.5 h-3.5 text-yellow-600" />
            <span className="text-xs font-medium text-gray-700">আলো</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {sensorData && sensorData.light_intensity >= 1000 
              ? `${(sensorData.light_intensity / 1000).toFixed(1)}K` 
              : Math.round(sensorData?.light_intensity || 0)}
          </div>
          <div className="mt-1.5 text-xs text-gray-600">lux</div>
        </motion.div>
      </div>

      {/* AI Insights Section - Compact */}
      {aiInsight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`rounded-lg p-3 border ${getInsightColor(aiInsight.status)}`}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-800 mb-2 leading-relaxed font-medium">
                {aiInsight.message}
              </p>
              {aiInsight.recommendations.length > 0 && aiInsight.status !== 'excellent' && (
                <div className="space-y-1">
                  <ul className="space-y-1">
                    {aiInsight.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-purple-600 text-xs">•</span>
                        <span className="flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* View Details Link */}
      <div className="pt-2 border-t border-gray-100">
        <a
          href="/dashboard/iot"
          className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 group"
        >
          সম্পূর্ণ IoT ড্যাশবোর্ড দেখুন
          <svg 
            className="w-3 h-3 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default IoTSensorCard;
