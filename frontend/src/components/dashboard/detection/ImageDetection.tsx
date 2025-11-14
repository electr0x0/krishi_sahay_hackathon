'use client'

import { useState, useRef } from 'react';
import { Upload, X, Eye, MessageCircle, Sparkles, Activity, TrendingUp, Clock, AlertCircle, CheckCircle2, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@/styles/markdown.css';

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
  yolo_processing_time?: number;
  gemini_processing_time?: number;
  // AI Analysis fields
  growth_stage?: string;
  growth_stage_en?: string;
  plant_health_score?: number;
  ai_disease_analysis?: string;
  ai_disease_analysis_en?: string;
  treatment_recommendations?: string;
  treatment_recommendations_en?: string;
  preventive_measures?: string;
  preventive_measures_en?: string;
  expected_recovery_time?: string;
  severity_assessment?: string;
  additional_observations?: string;
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Leaf className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">সনাক্তকরণ</p>
                  <p className="text-2xl font-bold text-blue-600">{result.detection_count}</p>
                </motion.div>
                
                {result.plant_health_score !== undefined && (
                  <motion.div 
                    className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Activity className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">স্বাস্থ্য স্কোর</p>
                    <p className="text-2xl font-bold text-green-600">{result.plant_health_score.toFixed(0)}</p>
                  </motion.div>
                )}
                
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Clock className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">YOLO সময়</p>
                  <p className="text-xl font-bold text-purple-600">
                    {result.yolo_processing_time?.toFixed(2)}s
                  </p>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Sparkles className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">AI বিশ্লেষণ সময়</p>
                  <p className="text-xl font-bold text-orange-600">
                    {result.gemini_processing_time?.toFixed(2)}s
                  </p>
                </motion.div>
              </div>

              {/* AI Comprehensive Analysis Section */}
              {result.growth_stage && (
                <motion.div 
                  className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-purple-200/50 shadow-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {/* Header with Icon */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">AI বিস্তারিত বিশ্লেষণ</h4>
                      <p className="text-sm text-gray-600">Gemini 2.5 Flash দ্বারা চালিত</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Growth Stage */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                      <div className="flex items-start">
                        <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">বৃদ্ধির পর্যায়</h5>
                          <p className="text-gray-700 leading-relaxed">{result.growth_stage}</p>
                          {result.growth_stage_en && (
                            <p className="text-xs text-gray-500 mt-1 italic">{result.growth_stage_en}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Health Score Visualization */}
                    {result.plant_health_score !== undefined && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-start mb-2">
                          <Activity className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                          <h5 className="font-semibold text-gray-900">উদ্ভিদ স্বাস্থ্য স্কোর</h5>
                        </div>
                        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              result.plant_health_score >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              result.plant_health_score >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-red-500 to-rose-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${result.plant_health_score}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                          />
                        </div>
                        <p className="text-right text-sm font-semibold mt-1 text-gray-700">
                          {result.plant_health_score.toFixed(0)}/100
                        </p>
                      </div>
                    )}

                    {/* Severity Assessment */}
                    {result.severity_assessment && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-start">
                          <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${
                            result.severity_assessment.includes('গুরুতর') || result.severity_assessment.includes('অত্যন্ত') ? 'text-red-600' :
                            result.severity_assessment.includes('মাঝারি') ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">তীব্রতা মূল্যায়ন</h5>
                            <p className="text-gray-700 leading-relaxed">{result.severity_assessment}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Disease Analysis */}
                    {result.ai_disease_analysis && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">রোগের বিশ্লেষণ</h5>
                            <div className="detection-markdown">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.ai_disease_analysis}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Treatment Recommendations */}
                    {result.treatment_recommendations && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300 shadow-sm">
                        <div className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">চিকিৎসার সুপারিশ</h5>
                            <div className="detection-markdown">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.treatment_recommendations}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preventive Measures */}
                    {result.preventive_measures && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-300 shadow-sm">
                        <div className="flex items-start">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">প্রতিরোধমূলক ব্যবস্থা</h5>
                            <div className="detection-markdown">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.preventive_measures}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Expected Recovery Time */}
                    {result.expected_recovery_time && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">প্রত্যাশিত সুস্থ হওয়ার সময়</h5>
                            <p className="text-gray-700 leading-relaxed">{result.expected_recovery_time}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Observations */}
                    {result.additional_observations && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50">
                        <div className="flex items-start">
                          <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">অতিরিক্ত পর্যবেক্ষণ</h5>
                            <div className="detection-markdown">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result.additional_observations}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

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
