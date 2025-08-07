'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, History, Camera } from 'lucide-react';
import api from '@/lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DetectionPage() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Camera className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">উদ্ভিদ রোগ শনাক্তকরণ</h1>
            <p className="text-gray-600">AI ব্যবহার করে গাছের পাতার রোগ চিহ্নিত করুন</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'upload'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>নতুন পরীক্ষা</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'history'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <History className="h-4 w-4" />
              <span>ইতিহাস</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'upload' ? (
            <motion.div key="upload" variants={cardVariants} initial="hidden" animate="visible">
              <DetectionUploadComponent />
            </motion.div>
          ) : (
            <motion.div key="history" variants={cardVariants} initial="hidden" animate="visible">
              <DetectionHistoryComponent />
            </motion.div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">সমর্থিত ফসল</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• আপেল, টমেটো, আলু</p>
            <p>• ভুট্টা, সয়াবিন, মরিচ</p>
            <p>• আঙ্গুর, স্ট্রবেরি</p>
            <p>• এবং আরও অনেক...</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">শনাক্তকৃত রোগ</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• ব্যাকটেরিয়াল স্পট</p>
            <p>• আর্লি ব্লাইট</p>
            <p>• লেট ব্লাইট</p>
            <p>• মোজাইক ভাইরাস</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-3">ব্যবহারের টিপস</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• পরিষ্কার ছবি তুলুন</p>
            <p>• ভালো আলোতে ছবি নিন</p>
            <p>• পাতার উপরিভাগ দেখান</p>
            <p>• JPG/PNG ফরম্যাট ব্যবহার করুন</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Simple Detection Upload Component
function DetectionUploadComponent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);

  const handleFileSelect = (file: File) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setError('অনুগ্রহ করে JPG, JPEG বা PNG ফরম্যাটের ছবি নির্বাচন করুন।');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Use the real API call with confidence threshold
      console.log('Sending detection request...', { fileName: selectedFile.name, threshold: confidenceThreshold });
      console.log('API base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
      
      // Check if API is reachable first
      const response = await api.detectPlantDisease(selectedFile, confidenceThreshold);
      console.log('Detection response:', response);
      
      if (response && response.success) {
        setResult(response);
      } else {
        throw new Error(response?.message || 'API response was not successful');
      }
    } catch (err: any) {
      console.error('Detection error:', err);
      setError(`API Error: ${err.message || 'ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে।'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">ছবি আপলোড করুন</p>
          <p className="text-sm text-gray-500 mb-4">ড্র্যাগ করে ফেলুন অথবা ক্লিক করে নির্বাচন করুন</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            ছবি নির্বাচন করুন
          </button>
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {preview && (
            <div className="text-center">
              <img src={preview} alt="Preview" className="max-w-md mx-auto rounded-lg shadow-md" />
              <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
            </div>
          )}
          
          {/* Confidence Threshold Control */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              আত্মবিশ্বাসের সীমা: {Math.round(confidenceThreshold * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500">
              উচ্চ মান = কম ভুল পজিটিভ, কিন্তু কিছু রোগ মিস হতে পারে
            </p>
          </div>
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={uploadFile}
              disabled={isUploading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isUploading ? 'বিশ্লেষণ করা হচ্ছে...' : 'রোগ শনাক্ত করুন'}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setResult(null);
                setError(null);
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              বাতিল করুন
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-3">শনাক্তকরণের ফলাফল</h3>
          <p className="text-sm text-green-700 mb-4">
            প্রক্রিয়াকরণের সময়: {result.processing_time} সেকেন্ড
          </p>
          
          {result.detections?.length > 0 ? (
            <div className="space-y-2">
              {result.detections.map((detection: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-3 border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{detection.class_name}</p>
                      <p className="text-sm text-gray-600">
                        আত্মবিশ্বাস: {Math.round(detection.confidence * 100)}%
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      {detection.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-green-700">কোনো রোগ শনাক্ত হয়নি! গাছ সুস্থ মনে হচ্ছে।</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple Detection History Component
function DetectionHistoryComponent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.getDetectionHistory(0, 10);
        if (response.success) {
          setHistory(response.history || []);
        }
      } catch (err: any) {
        setError('ইতিহাস লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>ইতিহাস লোড করা হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">পূর্ববর্তী পরীক্ষাসমূহ</h3>
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <History className="mx-auto h-12 w-12 mb-4" />
          <p>কোনো ইতিহাস নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">পরীক্ষা #{item.id}</p>
                  <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
                  <p className="text-sm text-gray-600">
                    শনাক্তকৃত রোগ: {item.detection_count}টি
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.success ? 'সফল' : 'ব্যর্থ'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
