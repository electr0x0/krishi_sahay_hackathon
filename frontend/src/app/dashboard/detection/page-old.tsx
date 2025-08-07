'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, History, Camera, Video, Play } from 'lucide-react';
import Cookies from 'js-cookie';

// Type definitions
interface Detection {
  class_name: string;
  confidence: number;
  severity: string;
  original_class?: string;
  bbox?: number[];
}

interface DetectionResult {
  success: boolean;
  detection_count: number;
  detections: Detection[];
  processed_image_url?: string;
  original_image_url?: string;
  processing_time?: number;
}

interface HistoryItem {
  id: number;
  original_image_url: string;
  processed_image_url: string;
  detections: Detection[];
  detection_count: number;
  processing_time: number;
  confidence_threshold: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Helper functions for severity handling
const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'severe':
    case 'গুরুতর': 
      return 'bg-red-100 text-red-800';
    case 'moderate':
    case 'মাঝারি': 
      return 'bg-orange-100 text-orange-800';
    case 'mild':
    case 'হালকা': 
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
    case 'কম':
    default: 
      return 'bg-green-100 text-green-800';
  }
};

const getSeverityText = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'severe': return 'গুরুতর';
    case 'moderate': return 'মাঝারি';
    case 'mild': return 'হালকা';
    case 'low': return 'কম';
    case 'গুরুতর': return 'গুরুতর';
    case 'মাঝারি': return 'মাঝারি';
    case 'হালকা': return 'হালকা';
    case 'কম': return 'কম';
    default: return severity || 'কম';
  }
};

const isSevereSeverity = (severity: string) => {
  return severity?.toLowerCase() === 'severe' || severity?.toLowerCase() === 'গুরুতর';
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
              <DetectionUploadComponent onSwitchToHistory={() => setActiveTab('history')} />
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

// Enhanced Detection Upload Component with Video/Camera Support
function DetectionUploadComponent({ onSwitchToHistory }: { onSwitchToHistory: () => void }) {
  // Detection mode state
  const [detectionMode, setDetectionMode] = useState<'image' | 'video' | 'camera'>('image');
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = Cookies.get('auth_token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Image detection states (existing)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);

  // Video detection states  
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<{
    total_frames?: number;
    processed_frames?: number;
    infected_frames?: number;
    total_detections?: number;
    output_path?: string;
    detection_history?: Array<{
      frame_number: number;
      timestamp: number;
      detections: Detection[];
      detection_count: number;
    }>;
    summary?: string;
  } | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [capturedImage, setCapturedImage] = useState<{
    image: string;
    result?: DetectionResult;
  } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Refs for camera (following your working project pattern)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Camera device enumeration
  const enumerateCameras = useCallback(async () => {
    try {
      // First request temporary access to get device labels (like in your working project)
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Stop the temporary stream
      tempStream.getTracks().forEach(track => track.stop());
      
      // Now enumerate devices with proper labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices); // Debug log
      setAvailableCameras(videoDevices);
      
      // Set default camera if none selected and we have devices
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating cameras:', err);
      setError('ক্যামেরা তালিকা পেতে সমস্যা হয়েছে।');
    }
  }, [selectedCameraId]);

  // Load available cameras when camera mode is selected
  useEffect(() => {
    if (detectionMode === 'camera' && availableCameras.length === 0) {
      enumerateCameras();
    }
  }, [detectionMode, availableCameras.length, enumerateCameras]);

  // Get available cameras with labels (following your working project)
  useEffect(() => {
    async function getDevices() {
      try {
        // First request temporary access to get device labels
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        tempStream.getTracks().forEach(track => track.stop());
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        setAvailableCameras(videoDevices);
        
        // If we have devices but none selected, select the first one
        if (videoDevices.length > 0 && !selectedCameraId) {
          setSelectedCameraId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error getting devices:', error);
        setError('ক্যামেরা তালিকা পেতে সমস্যা হয়েছে।');
      }
    }

    if (detectionMode === 'camera') {
      getDevices();
    }
  }, [detectionMode, selectedCameraId]);

  // Auto-assign stream to video when video element becomes available
  useEffect(() => {
    if (videoRef.current && streamRef.current && isCameraActive && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play().catch(e => console.error('Error playing video:', e));
        }
      };
      
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
    }
  }, [isCameraActive]);

  // Handle device selection and stream (exactly like your working project)
  useEffect(() => {
    async function setupStream() {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }

      if (selectedCameraId && detectionMode === 'camera') {
        try {
          console.log('Attempting to access camera:', selectedCameraId);

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedCameraId },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });

          streamRef.current = stream;
          setIsCameraActive(true);

          // Retry mechanism for video element assignment
          const assignStreamToVideo = (retryCount = 0) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;

              videoRef.current.onloadedmetadata = () => {
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.error('Error playing video:', e));
                }
              };

              videoRef.current.play().catch(e => console.error('Error playing video:', e));
            } else {
              if (retryCount < 5) {
                setTimeout(() => assignStreamToVideo(retryCount + 1), 100);
              }
            }
          };

          assignStreamToVideo();
        } catch (error) {
          console.error('Error accessing camera:', error);
          setIsCameraActive(false);
          setError('ক্যামেরা অ্যাক্সেস করতে পারছি না।');
        }
      } else {
        setIsCameraActive(false);
      }
    }

    setupStream();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCameraId, detectionMode]);

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
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence_threshold', confidenceThreshold.toString());

      const response = await fetch('http://localhost:8000/api/detection/detect', {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      console.log('Detection response:', data);
      
      if (data && data.success) {
        setResult(data);
      } else {
        throw new Error(data?.message || 'API response was not successful');
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Detection error:', error);
      setError(`API Error: ${error.message || 'ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে।'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Video handlers
  const handleVideoSelect = (file: File) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      setError(null);
      setVideoResult(null);
      
      const reader = new FileReader();
      reader.onload = (e) => setVideoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setError('অনুগ্রহ করে একটি ভিডিও ফাইল নির্বাচন করুন।');
    }
  };

  const processVideo = async () => {
    if (!selectedVideo) return;
    
    setIsProcessingVideo(true);
    setError(null);
    setVideoProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedVideo);
      formData.append('confidence_threshold', confidenceThreshold.toString());

      const response = await fetch('http://localhost:8000/api/detection/detect-video', {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Video processing failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.progress !== undefined) {
                setVideoProgress(data.progress);
              } else if (data.status === 'completed') {
                // Handle completion event with all data
                setVideoResult(data);
              } else if (data.result) {
                setVideoResult(data.result);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Video processing error:', error);
      setError(`Video Error: ${error.message || 'ভিডিও প্রক্রিয়াকরণে সমস্যা হয়েছে।'}`);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Camera handlers (simplified, following your working project pattern)
  const startCamera = () => {
    // Camera will start automatically via useEffect when selectedCameraId changes
    // This is just for button click
    if (selectedCameraId && detectionMode === 'camera') {
      setIsCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Switch camera device (following your working project pattern)
  const switchCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
    // The useEffect will handle the stream switching automatically
  };

  // Handle capture (following your working project)
  const capturePhoto = async () => {
    if (detectionMode === 'camera' && videoRef.current && isCameraActive) {
      setIsCapturing(true);
      
      try {
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error('Cannot get canvas context');
        
        ctx.drawImage(video, 0, 0);
        
        const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
        const capturedImageUrl = canvas.toDataURL('image/jpeg');
        
        // Process the captured image using the same endpoint as image upload
        const formData = new FormData();
        formData.append('file', new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'image/jpeg' }), 'camera-capture.jpg');
        formData.append('confidence_threshold', confidenceThreshold.toString());

        const response = await fetch('http://localhost:8000/api/detection/detect', {
          method: 'POST',
          body: formData,
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          throw new Error(`Detection failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data && data.success) {
          setCapturedImage({
            image: capturedImageUrl,
            result: data
          });
        } else {
          throw new Error(data?.message || 'Camera detection was not successful');
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error('Photo capture error:', error);
        setError(`Capture Error: ${error.message || 'ছবি তুলতে সমস্যা হয়েছে।'}`);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl"
        >
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI দিয়ে বিশ্লেষণ করা হচ্ছে...</h3>
            <p className="text-sm text-gray-600">অনুগ্রহ করে অপেক্ষা করুন</p>
          </div>
        </motion.div>
      )}

      {/* Detection Mode Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setDetectionMode('image')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              detectionMode === 'image'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-4 h-4 mr-2" />
            ছবি ডিটেকশন
          </button>
          <button
            onClick={() => setDetectionMode('video')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              detectionMode === 'video'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Play className="w-4 h-4 mr-2" />
            ভিডিও ডিটেকশন
          </button>
          <button
            onClick={() => setDetectionMode('camera')}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              detectionMode === 'camera'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Video className="w-4 h-4 mr-2" />
            লাইভ ক্যামেরা
          </button>
        </div>
      </div>

      {/* Image Detection Mode */}
      {detectionMode === 'image' && (
        <>
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors"
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
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-md mx-auto rounded-lg shadow-md h-auto object-contain"
                    style={{ maxHeight: '400px' }}
                  />
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
            />
            <p className="text-xs text-gray-500">
              উচ্চ মান = কম ভুল পজিটিভ, কিন্তু কিছু রোগ মিস হতে পারে
            </p>
          </div>
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={uploadFile}
              disabled={isUploading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>বিশ্লেষণ করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>রোগ শনাক্ত করুন</span>
                </>
              )}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </motion.div>
      )}

      {result && result.success && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">শনাক্তকরণ সম্পন্ন!</h3>
                <p className="text-sm text-green-600">
                  প্রক্রিয়াকরণের সময়: {result.processing_time?.toFixed(3)} সেকেন্ড
                </p>
              </div>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{result.detection_count}</div>
                <div className="text-xs text-gray-600">শনাক্তকৃত রোগ</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.detections?.[0]?.confidence ? Math.round(result.detections[0].confidence * 100) : 0}%
                </div>
                <div className="text-xs text-gray-600">সর্বোচ্চ আত্মবিশ্বাস</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(confidenceThreshold * 100)}%</div>
                <div className="text-xs text-gray-600">থ্রেশহোল্ড</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {result.detections?.filter(d => isSevereSeverity(d.severity)).length || 0}
                </div>
                <div className="text-xs text-gray-600">গুরুতর রোগ</div>
              </div>
            </div>
          </div>

          {/* Image Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800">মূল ছবি</h4>
              </div>
              <div className="p-4">
                <div className="relative group">
                  {preview && (
                    <img
                      src={preview}
                      alt="Original"
                      className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105 object-contain"
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Processed Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-800">প্রক্রিয়াকৃত ছবি</h4>
              </div>
              <div className="p-4">
                <div className="relative group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.processed_image_url}`}
                    alt="Processed with detections"
                    className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105 object-contain"
                    onError={(e) => {
                      console.error('Image load error:', e.currentTarget.src);
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.fallback-div') as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'block';
                      }
                    }}
                  />
                  {/* Error fallback */}
                  <div className="fallback-div hidden bg-gray-100 rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">ছবি লোড করতে পারেনি</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detection Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800">
                শনাক্তকৃত রোগসমূহ ({result.detection_count}টি)
              </h4>
            </div>
            <div className="p-6">
              {result.detections && result.detections.length > 0 ? (
                <div className="space-y-4">
                  {result.detections.map((detection: Detection, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {detection.class_name}
                          </h5>
                          <p className="text-sm text-gray-600 mb-2">
                            মূল শ্রেণি: {detection.original_class}
                          </p>
                          <p className="text-sm text-gray-600">
                            আত্মবিশ্বাস: {Math.round(detection.confidence * 100)}%
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(detection.severity)}`}>
                            {getSeverityText(detection.severity)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Confidence Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <motion.div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${detection.confidence * 100}%` }}
                          transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                        ></motion.div>
                      </div>
                      
                      {/* Bounding Box Info */}
                      {detection.bbox && (
                        <div className="text-xs text-gray-500">
                          অবস্থান: [{Math.round(detection.bbox[0])}, {Math.round(detection.bbox[1])}] - 
                          [{Math.round(detection.bbox[2])}, {Math.round(detection.bbox[3])}]
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">কোনো রোগ শনাক্ত হয়নি!</h3>
                  <p className="text-green-600">আপনার গাছের পাতা সুস্থ মনে হচ্ছে।</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                setResult(null);
                setError(null);
              }}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              নতুন ছবি আপলোড করুন
            </button>
            
            {result.original_image_url && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.original_image_url}`}
                download
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                মূল ছবি ডাউনলোড
              </a>
            )}
            
            {result.processed_image_url && (
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${result.processed_image_url}`}
                download
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                প্রক্রিয়াকৃত ছবি ডাউনলোড
              </a>
            )}

            <button
              onClick={() => onSwitchToHistory()}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              ইতিহাস দেখুন
            </button>
          </motion.div>
        </motion.div>
      )}
        </>
      )}

      {/* Video Detection Mode */}
      {detectionMode === 'video' && (
        <div className="space-y-6">
          {!selectedVideo ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              onClick={() => document.getElementById('video-input')?.click()}
            >
              <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">ভিডিও আপলোড করুন</p>
              <p className="text-sm text-gray-500 mb-4">MP4, AVI, MOV ফরম্যাটের ভিডিও নির্বাচন করুন</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                ভিডিও নির্বাচন করুন
              </button>
              <input
                id="video-input"
                type="file"
                accept="video/*"
                onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {videoPreview && (
                <div className="text-center">
                  <video 
                    src={videoPreview} 
                    controls
                    className="max-w-md mx-auto rounded-lg shadow-md"
                    style={{ maxHeight: '400px' }}
                  />
                  <p className="mt-2 text-sm text-gray-600">{selectedVideo.name}</p>
                </div>
              )}
              
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={processVideo}
                  disabled={isProcessingVideo}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isProcessingVideo ? 'প্রক্রিয়াকরণ চলছে...' : 'ভিডিও প্রক্রিয়া করুন'}
                </button>
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setVideoPreview(null);
                    setVideoResult(null);
                    setVideoProgress(0);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  নতুন ভিডিও
                </button>
              </div>

              {isProcessingVideo && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">প্রগতি</span>
                    <span className="text-sm text-blue-600">{Math.round(videoProgress)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {videoResult && (
                <div className="bg-white rounded-lg border p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">ভিডিও বিশ্লেষণের ফলাফল</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">মোট ফ্রেম</p>
                      <p className="text-lg font-semibold">{videoResult.total_frames || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">প্রক্রিয়াজাত ফ্রেম</p>
                      <p className="text-lg font-semibold text-blue-600">{videoResult.processed_frames || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">মোট সনাক্তকরণ</p>
                      <p className="text-lg font-semibold text-red-600">{videoResult.total_detections || 0}</p>
                    </div>
                  </div>
                  
                  {/* Video Comparison */}
                  {videoResult.output_path && videoPreview && (
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">ভিডিও তুলনা</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Original Video */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">মূল ভিডিও</h5>
                          <video
                            controls
                            className="w-full rounded-lg shadow-md"
                            style={{ maxHeight: '300px' }}
                          >
                            <source src={videoPreview} type="video/mp4" />
                            আপনার ব্রাউজার ভিডিও প্লেব্যাক সমর্থন করে না।
                          </video>
                        </div>
                        
                        {/* Processed Video */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-gray-700">প্রক্রিয়াজাত ভিডিও</h5>
                          <video
                            controls
                            className="w-full rounded-lg shadow-md"
                            style={{ maxHeight: '300px' }}
                          >
                            <source 
                              src={`http://localhost:8000/${videoResult.output_path}`} 
                              type="video/mp4" 
                            />
                            আপনার ব্রাউজার ভিডিও প্লেব্যাক সমর্থন করে না।
                          </video>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {videoResult.summary && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">সারসংক্ষেপ</p>
                      <p className="text-gray-800">{videoResult.summary}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Camera Detection Mode */}
      {detectionMode === 'camera' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">লাইভ ক্যামেরা</h3>
            
            {!isCameraActive ? (
              <div className="space-y-6">
                {/* Camera Selection */}
                {availableCameras.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      ক্যামেরা নির্বাচন করুন
                    </label>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => setSelectedCameraId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {availableCameras.map((camera, index) => (
                        <option key={camera.deviceId} value={camera.deviceId}>
                          {camera.label || `Camera ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="text-center py-8">
                  <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">ক্যামেরা চালু করুন</p>
                  <p className="text-sm text-gray-500 mb-6">রিয়েল-টাইম প্ল্যান্ট ডিজিজ ডিটেকশনের জন্য</p>
                  <button
                    onClick={startCamera}
                    disabled={availableCameras.length === 0}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {availableCameras.length === 0 ? 'ক্যামেরা খুঁজছি...' : 'ক্যামেরা চালু করুন'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Camera switching controls */}
                {availableCameras.length > 1 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        সক্রিয় ক্যামেরা
                      </label>
                      <select
                        value={selectedCameraId}
                        onChange={(e) => switchCamera(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {availableCameras.map((camera, index) => (
                          <option key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    width="640"
                    height="480"
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      backgroundColor: '#000',
                      borderRadius: '8px'
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>

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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
                  />
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={capturePhoto}
                    disabled={isCapturing}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isCapturing ? 'ক্যাপচার করছে...' : 'ছবি তুলুন'}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    ক্যামেরা বন্ধ করুন
                  </button>
                </div>

                {capturedImage && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">ক্যাপচার করা ছবি</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">তুলনা ভিউ:</span>
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            showComparison 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {showComparison ? 'পাশাপাশি' : 'একক'}
                        </button>
                      </div>
                    </div>

                    {showComparison ? (
                      /* Side-by-side comparison view */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Original Image */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          <div className="p-4 border-b border-gray-100">
                            <h5 className="font-semibold text-gray-800">মূল ছবি</h5>
                          </div>
                          <div className="p-4">
                            <div className="relative group">
                              <img
                                src={capturedImage.image}
                                alt="Original Captured"
                                className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105 object-contain"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* Processed Image */}
                        {capturedImage.result && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                          >
                            <div className="p-4 border-b border-gray-100">
                              <h5 className="font-semibold text-gray-800">প্রক্রিয়াকৃত ছবি</h5>
                            </div>
                            <div className="p-4">
                              <div className="relative group">
                                {capturedImage.result.processed_image_url ? (
                                  <img
                                    src={`http://localhost:8000${capturedImage.result.processed_image_url}`}
                                    alt="Processed Captured"
                                    className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105 object-contain"
                                  />
                                ) : (
                                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                                    <p className="text-gray-500">প্রক্রিয়াকৃত ছবি পাওয়া যায়নি</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      /* Single view */
                      <div className="bg-white rounded-lg border p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800 mb-3">ক্যাপচার করা ছবি</h5>
                            <img
                              src={capturedImage.image}
                              alt="Captured"
                              className="w-full h-auto rounded-lg shadow-sm max-h-96 object-contain mx-auto"
                            />
                          </div>
                          {capturedImage.result && (
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800 mb-3">ডিটেকশনের ফলাফল</h5>
                              {capturedImage.result.processed_image_url && (
                                <img
                                  src={`http://localhost:8000${capturedImage.result.processed_image_url}`}
                                  alt="Processed"
                                  className="w-full h-auto rounded-lg shadow-sm mb-4 max-h-96 object-contain mx-auto"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Detection Results Summary */}
                    {capturedImage.result && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-lg border p-6"
                      >
                        <h5 className="font-semibold text-gray-800 mb-4">ডিটেকশন সারসংক্ষেপ</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-gray-900">{capturedImage.result.detection_count}</p>
                            <p className="text-sm text-gray-600">মোট ডিটেকশন</p>
                          </div>
                          <div className={`rounded-lg p-4 text-center ${
                            capturedImage.result.detection_count > 0 ? 'bg-red-50' : 'bg-green-50'
                          }`}>
                            <p className={`text-2xl font-bold ${
                              capturedImage.result.detection_count > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {capturedImage.result.detection_count > 0 ? 'সংক্রমিত' : 'সুস্থ'}
                            </p>
                            <p className="text-sm text-gray-600">গাছের অবস্থা</p>
                          </div>
                          {capturedImage.result.detections?.[0]?.confidence && (
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                              <p className="text-2xl font-bold text-blue-600">
                                {(capturedImage.result.detections[0].confidence * 100).toFixed(1)}%
                              </p>
                              <p className="text-sm text-gray-600">আত্মবিশ্বাস</p>
                            </div>
                          )}
                        </div>

                        {/* Individual Detection Details */}
                        {capturedImage.result.detections && capturedImage.result.detections.length > 0 && (
                          <div className="mt-6">
                            <h6 className="font-medium text-gray-800 mb-3">বিস্তারিত ডিটেকশন</h6>
                            <div className="space-y-2">
                              {capturedImage.result.detections.map((detection, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                  <div>
                                    <span className="font-medium text-gray-900">{detection.class_name}</span>
                                    {detection.severity && (
                                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                        detection.severity === 'severe' ? 'bg-red-100 text-red-800' :
                                        detection.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {detection.severity}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {(detection.confidence * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 mt-6">
                          {capturedImage.result.processed_image_url && (
                            <a
                              href={`http://localhost:8000${capturedImage.result.processed_image_url}`}
                              download
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              প্রক্রিয়াকৃত ছবি ডাউনলোড
                            </a>
                          )}
                          <button
                            onClick={() => setCapturedImage(null)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            নতুন ক্যাপচার
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Detection History Component
function DetectionHistoryComponent() {
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = Cookies.get('auth_token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  };

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history on component mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/detection/history?skip=0&limit=10', {
          method: 'GET',
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('History API Response:', data); // Debug log
          setHistory(data.history || []);
        } else {
          setError('API থেকে ডেটা লোড করতে সমস্যা হয়েছে।');
        }
      } catch (err) {
        console.error('History load error:', err);
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
                <div className="flex-1">
                  <p className="font-medium">পরীক্ষা #{item.id}</p>
                  <p className="text-sm text-gray-600">{formatDate(item.created_at)}</p>
                  <p className="text-sm text-gray-600">
                    শনাক্তকৃত রোগ: {item.detection_count}টি
                  </p>
                  <p className="text-sm text-gray-600">
                    প্রক্রিয়াকরণের সময়: {item.processing_time?.toFixed(2)} সেকেন্ড
                  </p>
                  {item.detections && item.detections.length > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      প্রধান রোগ: {item.detections[0].class_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.success ? 'সফল' : 'ব্যর্থ'}
                  </span>
                  {item.processed_image_url && (
                    <img
                      src={`http://localhost:8000${item.processed_image_url}`}
                      alt="Processed result"
                      className="w-16 h-16 object-cover rounded border"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
