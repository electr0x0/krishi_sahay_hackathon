'use client'

import { useState, useEffect, useRef } from 'react';
import { Camera, Video, StopCircle, X } from 'lucide-react';

interface CameraDetectionProps {
  confidenceThreshold: number;
  getAuthHeaders: () => Record<string, string>;
}

interface CapturedImage {
  image: string;
  result?: {
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
    processing_time?: number;
  };
}

const CameraDetection: React.FC<CameraDetectionProps> = ({
  confidenceThreshold,
  getAuthHeaders
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<CapturedImage | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get available cameras
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
        if (cameras.length > 0 && !selectedCameraId) {
          setSelectedCameraId(cameras[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        setError('ক্যামেরা অ্যাক্সেস করতে সমস্যা হয়েছে।');
      }
    };

    getCameras();
  }, [selectedCameraId]);

  // Auto-assign stream to video when video element becomes available
  useEffect(() => {
    const assignStreamToVideo = () => {
      if (videoRef.current && streamRef.current && isCameraActive) {
        try {
          videoRef.current.srcObject = streamRef.current;
        } catch (error) {
          console.error('Error assigning stream to video:', error);
        }
      }
    };

    assignStreamToVideo();
  }, [isCameraActive]);

  // Start camera when selectedCameraId changes and camera should be active
  useEffect(() => {
    if (selectedCameraId && isCameraActive) {
      startCameraStream();
    }
  }, [selectedCameraId]);

  // Backup useEffect for delayed video element availability
  useEffect(() => {
    if (streamRef.current && videoRef.current && isCameraActive) {
      const timer = setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          try {
            videoRef.current.srcObject = streamRef.current;
          } catch (error) {
            console.error('Delayed stream assignment error:', error);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [streamRef.current, isCameraActive]);

  const startCameraStream = async () => {
    try {
      setError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Retry mechanism for video element assignment
      const assignStream = () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          return true;
        }
        return false;
      };

      if (!assignStream()) {
        // Retry after a short delay
        setTimeout(() => {
          assignStream();
        }, 100);
      }

    } catch (err) {
      console.error('Error starting camera:', err);
      setError('ক্যামেরা চালু করতে সমস্যা হয়েছে। অনুমতি দিন এবং আবার চেষ্টা করুন।');
      setIsCameraActive(false);
    }
  };

  const startCamera = () => {
    if (selectedCameraId) {
      setIsCameraActive(true);
      startCameraStream();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  };

  const switchCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context not available');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Convert data URL to blob for upload
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'camera-capture.jpg');
      formData.append('confidence_threshold', confidenceThreshold.toString());

      const detectionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detection/detect`, {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders(),
      });

      if (!detectionResponse.ok) {
        throw new Error('Detection failed');
      }

      const result = await detectionResponse.json();

      setCapturedImage({
        image: imageDataUrl,
        result: result
      });

    } catch (err) {
      console.error('Error capturing photo:', err);
      setError('ছবি ক্যাপচার করতে সমস্যা হয়েছে।');
    } finally {
      setIsCapturing(false);
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

            <div className="flex justify-center space-x-4">
              <button
                onClick={capturePhoto}
                disabled={isCapturing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center"
              >
                {isCapturing ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    বিশ্লেষণ চলছে...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    ছবি তুলুন ও বিশ্লেষণ করুন
                  </>
                )}
              </button>
              
              <button
                onClick={stopCamera}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                ক্যামেরা বন্ধ করুন
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

      {/* Captured Image Results */}
      {capturedImage && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">ক্যাপচার করা ছবির ফলাফল</h3>
            <button
              onClick={() => setCapturedImage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {capturedImage.result?.success ? (
            <div className="space-y-6">
              {/* Detection Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">সনাক্তকরণের সংখ্যা</p>
                  <p className="text-2xl font-bold text-blue-600">{capturedImage.result.detection_count}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">প্রক্রিয়াকরণের সময়</p>
                  <p className="text-2xl font-bold text-green-600">
                    {capturedImage.result.processing_time?.toFixed(2)}s
                  </p>
                </div>
              </div>

              {/* Image Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">মূল ছবি</h4>
                  <img
                    src={capturedImage.image}
                    alt="Original Captured"
                    className="w-full h-auto rounded-lg shadow-md border"
                  />
                </div>
                
                {capturedImage.result.processed_image_url && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">প্রক্রিয়াজাত ছবি</h4>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${capturedImage.result.processed_image_url}`}
                      alt="Processed with detections"
                      className="w-full h-auto rounded-lg shadow-md border"
                    />
                  </div>
                )}
              </div>

              {/* Detection Details */}
              {capturedImage.result.detections && capturedImage.result.detections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-gray-900">সনাক্তকৃত রোগসমূহ</h4>
                  <div className="space-y-2">
                    {capturedImage.result.detections.map((detection, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">
                              {detection.class_name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              আত্মবিশ্বাস: {(detection.confidence * 100).toFixed(1)}%
                            </p>
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
              <img
                src={capturedImage.image}
                alt="Captured"
                className="w-full h-auto rounded-lg shadow-md border max-w-md mx-auto mb-4"
              />
              {capturedImage.result ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">কোনো রোগ সনাক্ত হয়নি।</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে।</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraDetection;
