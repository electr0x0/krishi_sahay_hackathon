'use client'

import { useState, useRef } from 'react';
import { Upload, Video, Play, X } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoDetectionProps {
  confidenceThreshold: number;
  getAuthHeaders: () => Record<string, string>;
}

interface VideoResult {
  total_frames?: number;
  processed_frames?: number;
  infected_frames?: number;
  total_detections?: number;
  output_path?: string;
  detection_history?: Array<{
    frame_number: number;
    timestamp: number;
    detections: Array<{
      class_name: string;
      confidence: number;
      severity: string;
      original_class?: string;
      bbox?: number[];
    }>;
    detection_count: number;
  }>;
  summary?: string;
}

const VideoDetection: React.FC<VideoDetectionProps> = ({
  confidenceThreshold,
  getAuthHeaders
}) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      setVideoResult(null);
      setError(null);
      
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

  const resetVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
    setVideoResult(null);
    setError(null);
    setVideoProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ভিডিও আপলোড</h3>
        
        {!selectedVideo ? (
          <div className="text-center py-8">
            <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">ভিডিও ফাইল নির্বাচন করুন</p>
            <p className="text-sm text-gray-500 mb-6">MP4, AVI, MOV ফরম্যাট সমর্থিত</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Upload className="w-5 h-5 inline mr-2" />
              ভিডিও নির্বাচন করুন
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium text-gray-900">নির্বাচিত ভিডিও</h4>
              <button
                onClick={resetVideo}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {videoPreview && (
              <div className="text-center">
                <video
                  controls
                  className="max-w-md mx-auto rounded-lg shadow-md"
                  style={{ maxHeight: '300px' }}
                >
                  <source src={videoPreview} type="video/mp4" />
                  আপনার ব্রাউজার ভিডিও প্লেব্যাক সমর্থন করে না।
                </video>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={processVideo}
                disabled={isProcessingVideo}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isProcessingVideo ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    প্রক্রিয়াকরণ চলছে...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 inline mr-2" />
                    ভিডিও বিশ্লেষণ করুন
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

      {/* Progress Bar */}
      {isProcessingVideo && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">প্রক্রিয়াকরণের অগ্রগতি</h3>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{Math.round(videoProgress)}% সম্পন্ন</p>
        </div>
      )}

      {/* Video Results */}
      {videoResult && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">ভিডিও বিশ্লেষণের ফলাফল</h3>
          
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">মোট ফ্রেম</p>
              <p className="text-2xl font-bold text-blue-600">{videoResult.total_frames || 'N/A'}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">প্রক্রিয়াজাত ফ্রেম</p>
              <p className="text-2xl font-bold text-green-600">{videoResult.processed_frames || 0}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">মোট সনাক্তকরণ</p>
              <p className="text-2xl font-bold text-red-600">{videoResult.total_detections || 0}</p>
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
                  <VideoPlayer
                    src={videoPreview}
                    title="Original Video"
                  />
                </div>
                
                {/* Processed Video */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">প্রক্রিয়াজাত ভিডিও</h5>
                  <VideoPlayer
                    src={`http://localhost:8000/${videoResult.output_path}`}
                    title="Processed Video"
                  />
                </div>
              </div>
            </div>
          )}
          
          {videoResult.summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">সারসংক্ষেপ</p>
              <p className="text-gray-800">{videoResult.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoDetection;
