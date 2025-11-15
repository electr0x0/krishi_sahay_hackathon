"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Plus, Thermometer, Droplet, Sprout, AlertTriangle,
  Settings, History, TrendingUp, TrendingDown, Activity,
  Clock, Check, X, Edit2, Trash2, BarChart3
} from "lucide-react";
import ThresholdForm from "@/components/dashboard/notifications/ThresholdForm";
import NotificationHistory from "@/components/dashboard/notifications/NotificationHistory";
import CurrentReadings from "@/components/dashboard/notifications/CurrentReadings";
import api from "@/lib/api";

interface Threshold {
  id: number;
  sensor_type: string;
  threshold_type: string;
  threshold_value?: number;
  min_value?: number;
  max_value?: number;
  alert_name: string;
  alert_description?: string;
  severity: string;
  notification_channels: string[];
  cooldown_minutes: number;
  enabled: boolean;
  status: string;
  trigger_count: number;
  last_triggered_at?: string;
  created_at: string;
}

interface Summary {
  total_thresholds: number;
  active_thresholds: number;
  triggered_thresholds: number;
  total_notifications_sent: number;
  last_24h_notifications: number;
}

export default function NotificationsPage() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<Threshold | null>(null);
  const [activeTab, setActiveTab] = useState<"thresholds" | "history">("thresholds");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch thresholds
      const thresholdsData = await api.getThresholds();
      setThresholds(thresholdsData.thresholds || []);
      
      // Fetch summary
      const summaryData = await api.getThresholdSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThreshold = async (id: number) => {
    if (!confirm("এই থ্রেশহোল্ড মুছে ফেলতে চান?")) return;
    
    try {
      await api.deleteThreshold(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete threshold:", error);
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature": return <Thermometer className="w-5 h-5" />;
      case "humidity": return <Droplet className="w-5 h-5" />;
      case "soil_moisture": return <Sprout className="w-5 h-5" />;
      case "water_level": return <Droplet className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getSensorName = (type: string) => {
    const names: Record<string, string> = {
      temperature: "তাপমাত্রা",
      humidity: "আর্দ্রতা",
      soil_moisture: "মাটির আর্দ্রতা",
      water_level: "পানির স্তর",
      heat_index: "তাপ সূচক"
    };
    return names[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: "text-green-600 bg-green-50 border-green-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      high: "text-orange-600 bg-orange-50 border-orange-200",
      critical: "text-red-600 bg-red-50 border-red-200"
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IoT সতর্কতা</h1>
              <p className="text-gray-600">সেন্সর থ্রেশহোল্ড এবং নোটিফিকেশন পরিচালনা করুন</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingThreshold(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            নতুন থ্রেশহোল্ড যোগ করুন
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">মোট থ্রেশহোল্ড</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.total_thresholds}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">সক্রিয়</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.active_thresholds}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">ট্রিগার হয়েছে</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.triggered_thresholds}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">আজকের নোটিফিকেশন</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.last_24h_notifications}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-200 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <p className="text-sm text-gray-600">মোট নোটিফিকেশন</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.total_notifications_sent}</p>
          </motion.div>
        </div>
      )}

      {/* Current Sensor Readings */}
      <CurrentReadings />

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("thresholds")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === "thresholds"
              ? "bg-white shadow-lg text-blue-600"
              : "text-gray-600 hover:bg-white/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            থ্রেশহোল্ড সেটিংস
          </div>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === "history"
              ? "bg-white shadow-lg text-blue-600"
              : "text-gray-600 hover:bg-white/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            নোটিফিকেশন হিস্ট্রি
          </div>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "thresholds" ? (
          <motion.div
            key="thresholds"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {thresholds.map((threshold, index) => (
              <motion.div
                key={threshold.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 ${getSeverityColor(threshold.severity)} shadow-lg hover:shadow-xl transition-shadow`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityColor(threshold.severity)}`}>
                      {getSensorIcon(threshold.sensor_type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{threshold.alert_name}</h3>
                      <p className="text-sm text-gray-600">{getSensorName(threshold.sensor_type)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingThreshold(threshold);
                        setShowForm(true);
                      }}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteThreshold(threshold.id)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Threshold Value */}
                <div className="mb-4 p-4 bg-white/50 rounded-xl">
                  {threshold.threshold_type === "range" ? (
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      <span className="font-semibold">{threshold.min_value}</span>
                      <span className="text-gray-600">-</span>
                      <span className="font-semibold">{threshold.max_value}</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {threshold.threshold_type === "above" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-semibold">{threshold.threshold_value}</span>
                      <span className="text-gray-600">{threshold.threshold_type === "above" ? "এর উপরে" : "এর নিচে"}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">ট্রিগার সংখ্যা</p>
                    <p className="font-bold text-gray-900">{threshold.trigger_count}</p>
                  </div>
                  <div className="p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">কুলডাউন</p>
                    <p className="font-bold text-gray-900">{threshold.cooldown_minutes} মিনিট</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    threshold.status === "triggered" 
                      ? "bg-red-100 text-red-700"
                      : threshold.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {threshold.status === "triggered" ? "ট্রিগার হয়েছে" : threshold.enabled ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                  
                  {threshold.last_triggered_at && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {new Date(threshold.last_triggered_at).toLocaleDateString('bn-BD')}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {thresholds.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                <Bell className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold">কোনো থ্রেশহোল্ড সেট করা নেই</p>
                <p className="text-sm">নতুন থ্রেশহোল্ড যোগ করতে উপরের বোতামে ক্লিক করুন</p>
              </div>
            )}
          </motion.div>
        ) : (
          <NotificationHistory key="history" />
        )}
      </AnimatePresence>

      {/* Threshold Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ThresholdForm
            threshold={editingThreshold}
            onClose={() => {
              setShowForm(false);
              setEditingThreshold(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setEditingThreshold(null);
              fetchData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
