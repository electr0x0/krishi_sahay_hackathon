"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, CheckCircle, XCircle, AlertTriangle, Thermometer, Droplet, Sprout } from "lucide-react";
import api from "@/lib/api";

interface Notification {
  id: number;
  sensor_type: string;
  sensor_value: number;
  threshold_value?: number;
  threshold_type: string;
  message_sent: string;
  delivery_status: Record<string, string>;
  success: boolean;
  created_at: string;
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.getNotificationHistory(50, 0);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "temperature": return <Thermometer className="w-4 h-4" />;
      case "humidity": return <Droplet className="w-4 h-4" />;
      case "soil_moisture": return <Sprout className="w-4 h-4" />;
      case "water_level": return <Droplet className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Bell className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-semibold">কোনো নোটিফিকেশন নেই</p>
        <p className="text-sm">আপনার থ্রেশহোল্ড ট্রিগার হলে এখানে দেখানো হবে</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                notification.success ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}>
                {getSensorIcon(notification.sensor_type)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{getSensorName(notification.sensor_type)}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  {formatDate(notification.created_at)}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {notification.success ? (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                পাঠানো হয়েছে
              </div>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                <XCircle className="w-4 h-4" />
                ব্যর্থ
              </div>
            )}
          </div>

          {/* Sensor Value */}
          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">সেন্সর মান</p>
                <p className="text-2xl font-bold text-gray-900">{notification.sensor_value.toFixed(1)}</p>
              </div>
              {notification.threshold_value && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">থ্রেশহোল্ড</p>
                  <p className="text-2xl font-bold text-gray-900">{notification.threshold_value.toFixed(1)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">ধরন</p>
                <p className="text-sm font-semibold text-gray-900">
                  {notification.threshold_type === "above" ? "উপরে" : notification.threshold_type === "below" ? "নিচে" : "সীমার বাইরে"}
                </p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{notification.message_sent}</p>
          </div>

          {/* Delivery Status */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {Object.entries(notification.delivery_status).map(([channel, status]) => (
              <div
                key={channel}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  status === "sent"
                    ? "bg-green-100 text-green-700"
                    : status === "queued"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {channel}: {status}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

