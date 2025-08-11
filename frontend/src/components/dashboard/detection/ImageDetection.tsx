'use client'

import { useState, useRef } from 'react';
import { Upload, X, Eye, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ImageDetectionProps {
  confidenceThreshold: number;
  getAuthHeaders: () => Record<string, string>;
}

interface DetectionResult {
  success: boolean;
  detection_count: number;
  detections: Array<{
    class_name: string;
    confidence: number;
    severity: string;
    original_class?: string;
    bbox?: number[];
  }>;
  processed_image_url?: string;
  original_image_url?: string;
  processing_time?: number;
}

const ImageDetection: React.FC<ImageDetectionProps> = ({
  confidenceThreshold,
  getAuthHeaders
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const redirectToChat = () => {
    // Navigate to chat with prefilled message
    const message = "আমার শেষ ছবি সনাক্তকরণের ফলাফল বিশ্লেষণ করুন";
    const encodedMessage = encodeURIComponent(message);
    router.push(`/dashboard/chat?message=${encodedMessage}&send=true`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
      setShowComparison(false);
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setError('অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।');
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence_threshold', confidenceThreshold.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detection/detect`, {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      setResult(data);
      
      if (data.success && data.detection_count > 0) {
        setShowComparison(true);
      }
      
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Detection error:', error);
      setError(`Error: ${error.message || 'ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে।'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setShowComparison(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
      case 'গুরুতর': 
        return 'bg-red-100 text-red-800';
      case 'moderate':
      case 'মাঝারি':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
      case 'হালকা':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ছবি আপলোড</h3>
        
        {!selectedFile ? (
          <div className="text-center py-8">
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">ছবি ফাইল নির্বাচন করুন</p>
            <p className="text-sm text-gray-500 mb-6">JPG, PNG, বা অন্যান্য ছবি ফরম্যাট সমর্থিত</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Upload className="w-5 h-5 inline mr-2" />
              ছবি নির্বাচন করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">নির্বাচিত ছবি</h4>
              <button
                onClick={resetFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {preview && (
              <div className="text-center">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-w-md mx-auto rounded-lg shadow-md h-auto object-contain"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}

            <div className="text-center">
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isProcessing ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    বিশ্লেষণ চলছে...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 inline mr-2" />
                    রোগ সনাক্ত করুন
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">বিশ্লেষণের ফলাফল</h3>
          
          {result.success ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">সনাক্তকরণের সংখ্যা</p>
                  <p className="text-2xl font-bold text-blue-600">{result.detection_count}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">প্রক্রিয়াকরণের সময়</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.processing_time?.toFixed(2)}s
                  </p>
                </div>
              </div>

              {/* Image Comparison */}
              {showComparison && result.processed_image_url && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900">ছবি তুলনা</h4>
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showComparison ? 'লুকান' : 'দেখান'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">মূল ছবি</h5>
                      <img
                        src={preview}
                        alt="Original"
                        className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="group relative">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">প্রক্রিয়াজাত ছবি</h5>
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${result.processed_image_url}`}
                        alt="Processed with detections"
                        className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Detection Details */}
              {result.detections && result.detections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-gray-900">সনাক্তকৃত রোগসমূহ</h4>
                  <div className="space-y-2">
                    {result.detections.map((detection, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {detection.class_name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              আত্মবিশ্বাস: {(detection.confidence * 100).toFixed(1)}%
                            </p>
                            {detection.original_class && (
                              <p className="text-xs text-gray-500 mt-1">
                                মূল শ্রেণী: {detection.original_class}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(detection.severity)}`}>
                            {detection.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800 font-medium">কোনো রোগ সনাক্ত হয়নি।</p>
                <p className="text-yellow-700 text-sm mt-1">
                  ছবিটি সুস্থ অথবা মান যথেষ্ট নয়।
                </p>
              </div>
            </div>
          )}

          {/* Chat Analysis Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={redirectToChat}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>চ্যাটে ফলাফল বিশ্লেষণ করুন</span>
            </button>
            <p className="text-sm text-gray-500 text-center mt-2">
              AI চ্যাটবট আপনার সনাক্তকরণের ফলাফল বিস্তারিত বিশ্লেষণ করবে
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDetection;
