'use client'

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, Video, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const SimpleVideoDetection = ({ onSwitchToHistory }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Simple API call function
  const makeApiCall = async (endpoint, formData) => {
    const token = localStorage.getItem('access_token') || 
                 document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('অনুগ্রহ করে একটি বৈধ ছবি নির্বাচন করুন।');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence_threshold', '0.25');

      console.log('Uploading to: /api/detection/detect');
      const response = await makeApiCall('/api/detection/detect', formData);
      
      console.log('Response:', response);
      setResult(response);
      
      if (onSwitchToHistory) {
        setTimeout(() => onSwitchToHistory(), 2000);
      }
    } catch (error) {
      console.error('Detection error:', error);
      setError(`API Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
           onClick={() => fileInputRef.current?.click()}>
        {preview ? (
          <div className="space-y-4">
            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              নতুন ছবি
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">ছবি আপলোড করুন</p>
              <p className="text-gray-500">JPG, PNG ফরম্যাট সাপোর্টেড</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          !selectedFile || isUploading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            প্রক্রিয়াকরণ...
          </div>
        ) : (
          'রোগ শনাক্ত করুন'
        )}
      </button>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Success Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 font-medium">শনাক্তকরণ সফল!</span>
            </div>
            
            <div className="space-y-2">
              <p>মোট {result.detection_count}টি রোগ শনাক্ত হয়েছে</p>
              
              {result.detections?.map((detection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <span className="font-medium">{detection.class_name}</span>
                    <p className="text-sm text-gray-600">আত্মবিশ্বাস: {(detection.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    detection.severity === 'গুরুতর' ? 'bg-red-100 text-red-800' :
                    detection.severity === 'মাঝারি' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {detection.severity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex space-x-2">
              <button onClick={reset} className="flex-1 py-2 px-4 bg-gray-200 rounded hover:bg-gray-300">
                আবার চেষ্টা করুন
              </button>
              {onSwitchToHistory && (
                <button onClick={onSwitchToHistory} className="flex-1 py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
                  ইতিহাস দেখুন
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SimpleVideoDetection;
