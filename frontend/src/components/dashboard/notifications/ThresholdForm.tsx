"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Thermometer, Droplet, Sprout } from "lucide-react";
import api from "@/lib/api";

interface ThresholdFormProps {
  threshold: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ThresholdForm({ threshold, onClose, onSuccess }: ThresholdFormProps) {
  const [formData, setFormData] = useState({
    sensor_type: "temperature",
    threshold_type: "above",
    threshold_value: "",
    min_value: "",
    max_value: "",
    alert_name: "",
    alert_description: "",
    severity: "medium",
    notification_message: "",
    cooldown_minutes: "60",
    enabled: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (threshold) {
      setFormData({
        sensor_type: threshold.sensor_type,
        threshold_type: threshold.threshold_type,
        threshold_value: threshold.threshold_value?.toString() || "",
        min_value: threshold.min_value?.toString() || "",
        max_value: threshold.max_value?.toString() || "",
        alert_name: threshold.alert_name,
        alert_description: threshold.alert_description || "",
        severity: threshold.severity,
        notification_message: threshold.notification_message || "",
        cooldown_minutes: threshold.cooldown_minutes.toString(),
        enabled: threshold.enabled
      });
    }
  }, [threshold]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        sensor_type: formData.sensor_type,
        threshold_type: formData.threshold_type,
        alert_name: formData.alert_name,
        alert_description: formData.alert_description || null,
        severity: formData.severity,
        notification_channels: ["whatsapp"],
        notification_message: formData.notification_message || null,
        cooldown_minutes: parseInt(formData.cooldown_minutes),
        enabled: formData.enabled
      };

      if (formData.threshold_type === "range") {
        payload.min_value = parseFloat(formData.min_value);
        payload.max_value = parseFloat(formData.max_value);
      } else {
        payload.threshold_value = parseFloat(formData.threshold_value);
      }

      if (threshold) {
        await api.updateThreshold(threshold.id, payload);
      } else {
        await api.createThreshold(payload);
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Form submission error:", error);
      alert(`Failed: ${error.message || "An error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {threshold ? "থ্রেশহোল্ড সম্পাদনা করুন" : "নতুন থ্রেশহোল্ড যোগ করুন"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sensor Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">সেন্সর টাইপ</label>
            <select
              value={formData.sensor_type}
              onChange={(e) => setFormData({ ...formData, sensor_type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="temperature">তাপমাত্রা (Temperature)</option>
              <option value="humidity">আর্দ্রতা (Humidity)</option>
              <option value="soil_moisture">মাটির আর্দ্রতা (Soil Moisture)</option>
              <option value="water_level">পানির স্তর (Water Level)</option>
              <option value="heat_index">তাপ সূচক (Heat Index)</option>
            </select>
          </div>

          {/* Alert Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">সতর্কতার নাম</label>
            <input
              type="text"
              value={formData.alert_name}
              onChange={(e) => setFormData({ ...formData, alert_name: e.target.value })}
              placeholder="উদাহরণ: উচ্চ তাপমাত্রা সতর্কতা"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* Threshold Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">সতর্কতার ধরন</label>
            <select
              value={formData.threshold_type}
              onChange={(e) => setFormData({ ...formData, threshold_type: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="above">উপরে (Above)</option>
              <option value="below">নিচে (Below)</option>
              <option value="range">সীমার বাইরে (Outside Range)</option>
            </select>
          </div>

          {/* Threshold Values */}
          {formData.threshold_type === "range" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">সর্বনিম্ন মান</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.min_value}
                  onChange={(e) => setFormData({ ...formData, min_value: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">সর্বোচ্চ মান</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.max_value}
                  onChange={(e) => setFormData({ ...formData, max_value: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">থ্রেশহোল্ড মান</label>
              <input
                type="number"
                step="0.1"
                value={formData.threshold_value}
                onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Severity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">তীব্রতা</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="low">নিম্ন (Low)</option>
              <option value="medium">মাঝারি (Medium)</option>
              <option value="high">উচ্চ (High)</option>
              <option value="critical">সংকটপূর্ণ (Critical)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">বিবরণ (ঐচ্ছিক)</label>
            <textarea
              value={formData.alert_description}
              onChange={(e) => setFormData({ ...formData, alert_description: e.target.value })}
              rows={2}
              placeholder="এই সতর্কতা সম্পর্কে আরও তথ্য..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Notification Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">কাস্টম বার্তা (ঐচ্ছিক)</label>
            <textarea
              value={formData.notification_message}
              onChange={(e) => setFormData({ ...formData, notification_message: e.target.value })}
              rows={3}
              placeholder="WhatsApp এ পাঠানোর জন্য কাস্টম বার্তা..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Cooldown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">কুলডাউন (মিনিট)</label>
            <input
              type="number"
              min="5"
              max="1440"
              value={formData.cooldown_minutes}
              onChange={(e) => setFormData({ ...formData, cooldown_minutes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">পরবর্তী সতর্কতা পাঠানোর আগে অপেক্ষা করার সময়</p>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-semibold text-gray-700">সতর্কতা সক্রিয় করুন</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                formData.enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.enabled ? "translate-x-7" : ""
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? "সংরক্ষণ করা হচ্ছে..." : threshold ? "আপডেট করুন" : "তৈরি করুন"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

