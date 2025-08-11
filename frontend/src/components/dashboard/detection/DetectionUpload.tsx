'use client'

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const DetectionUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setError('অনুগ্রহ করে JPG, JPEG বা PNG ফরম্যাটের ছবি নির্বাচন করুন।');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await api.detectPlantDisease(selectedFile, confidenceThreshold);
      setResult(response);
    } catch (err) {
      setError(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsUploading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'গুরুতর';
      case 'moderate': return 'মাঝারি';
      case 'mild': return 'হালকা';
      default: return 'কম';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>ছবি আপলোড করুন</CardTitle>
          <CardDescription>
            গাছের পাতার ছবি আপলোড করুন রোগ শনাক্তকরণের জন্য
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                ছবি আপলোড করুন
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ড্র্যাগ করে ফেলুন অথবা ক্লিক করে নির্বাচন করুন
              </p>
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                ছবি নির্বাচন করুন
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>ফাইলের নাম:</strong> {selectedFile.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>ফাইলের আকার:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {/* Confidence Threshold */}
          {selectedFile && (
            <div className="mt-6 space-y-3">
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !result && (
            <div className="mt-6 text-center">
              <Button
                onClick={uploadFile}
                disabled={isUploading}
                size="lg"
                className="min-w-32"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    বিশ্লেষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    রোগ শনাক্ত করুন
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>শনাক্তকরণের ফলাফল</span>
              </CardTitle>
              <CardDescription>
                প্রক্রিয়াকরণের সময়: {result.processing_time?.toFixed(2)} সেকেন্ড
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Processed Image */}
              {result.processed_image_url && (
                <div>
                  <h4 className="font-medium mb-3">প্রক্রিয়াকৃত ছবি</h4>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}}${result.processed_image_url}`}
                    alt="Processed"
                    className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Detection Results */}
              <div>
                <h4 className="font-medium mb-3">
                  শনাক্তকৃত রোগসমূহ ({result.detection_count}টি)
                </h4>
                {result.detections && result.detections.length > 0 ? (
                  <div className="grid gap-4">
                    {result.detections.map((detection, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h5 className="font-medium text-gray-900">
                              {detection.class_name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              আত্মবিশ্বাস: {Math.round(detection.confidence * 100)}%
                            </p>
                          </div>
                          <Badge className={getSeverityColor(detection.severity)}>
                            {getSeverityText(detection.severity)}
                          </Badge>
                        </div>
                        <Progress 
                          value={detection.confidence * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <p className="text-lg font-medium">কোনো রোগ শনাক্ত হয়নি!</p>
                    <p className="text-sm">আপনার গাছের পাতা সুস্থ মনে হচ্ছে।</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button variant="outline" onClick={removeFile}>
                  নতুন ছবি আপলোড করুন
                </Button>
                {result.processed_image_url && (
                  <Button variant="outline" asChild>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}${result.processed_image_url}`}
                      download
                    >
                      ছবি ডাউনলোড করুন
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DetectionUpload;
