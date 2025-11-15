"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Thermometer, Droplet, Sprout, Activity, RefreshCw } from "lucide-react";
import api from "@/lib/api";

interface Reading {
  temperature?: number;
  humidity?: number;
  soil_moisture?: number;
  water_level?: number;
  heat_index?: number;
  last_updated?: string;
}

export default function CurrentReadings() {
  const [readings, setReadings] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentSensorReadings();
      setReadings(data);
    } catch (error) {
      console.error("Failed to fetch readings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!readings || !readings.last_updated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg mb-8"
      >
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Activity className="w-8 h-8 mr-3" />
          <span>কোনো সেন্সর ডেটা পাওয়া যায়নি</span>
        </div>
      </motion.div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('bn-BD', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-lg mb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">বর্তমান সেন্সর রিডিং</h3>
            <p className="text-sm text-gray-600">সর্বশেষ আপডেট: {formatDate(readings.last_updated)}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchReadings}
          disabled={loading}
          className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Readings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Temperature */}
        {readings.temperature !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border-2 border-red-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-red-600" />
              <span className="text-sm font-semibold text-gray-700">তাপমাত্রা</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{readings.temperature.toFixed(1)}</p>
            <p className="text-xs text-gray-600">°C</p>
          </motion.div>
        )}

        {/* Humidity */}
        {readings.humidity !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">আর্দ্রতা</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{readings.humidity.toFixed(1)}</p>
            <p className="text-xs text-gray-600">%</p>
          </motion.div>
        )}

        {/* Soil Moisture */}
        {readings.soil_moisture !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border-2 border-green-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">মাটির আর্দ্রতা</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{readings.soil_moisture.toFixed(1)}</p>
            <p className="text-xs text-gray-600">%</p>
          </motion.div>
        )}

        {/* Water Level */}
        {readings.water_level !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border-2 border-cyan-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-semibold text-gray-700">পানির স্তর</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{readings.water_level.toFixed(1)}</p>
            <p className="text-xs text-gray-600">%</p>
          </motion.div>
        )}

        {/* Heat Index */}
        {readings.heat_index !== undefined && readings.heat_index !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">তাপ সূচক</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{readings.heat_index?.toFixed(1) || "N/A"}</p>
            <p className="text-xs text-gray-600">°C</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

