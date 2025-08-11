'use client'

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  Video, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Square,
  Download,
  RotateCcw,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/api';

const VideoDetectionUpload = ({ onSwitchToHistory }) => {
  // States for different detection modes
  const [activeMode, setActiveMode] = useState('image'); // image, video, camera, live
  
  // Image detection states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  
  // Video detection states
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<any>(null);
  
  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Live stream states
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [liveDetections, setLiveDetections] = useState<any[]>([]);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (websocket) {
        websocket.close();
      }
    };
  }, [cameraStream, websocket]);

  // Image Detection Functions
  const handleFileSelect = (file) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
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
      setError('অনুগ্রহ করে JPG, JPEG বা PNG ফরম্যাটের ছবি নির্বাচন করুন।');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence_threshold', confidenceThreshold.toString());

      const response = await api.post('/api/detection/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      if (onSwitchToHistory) {
        setTimeout(() => onSwitchToHistory(), 2000);
      }
    } catch (error) {
      console.error('Detection error:', error);
      setError(error.response?.data?.detail || 'ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setIsUploading(false);
    }
  };

  // Video Detection Functions
  const handleVideoSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
      setError(null);
      setVideoResult(null);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setVideoPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setError('অনুগ্রহ করে একটি বৈধ ভিডিও ফাইল নির্বাচন করুন।');
    }
  };

  const handleVideoUpload = async () => {
    if (!selectedVideo) return;

    setIsProcessingVideo(true);
    setError(null);
    setVideoProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedVideo);
      formData.append('confidence_threshold', confidenceThreshold.toString());
      formData.append('frame_skip', '5');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/detection/detect-video`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Video processing failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.status === 'processing') {
                setVideoProgress(data.progress || 0);
              } else if (data.status === 'completed') {
                setVideoResult(data);
                setVideoProgress(100);
              } else if (data.status === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              console.log('Skipping malformed data:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('Video processing error:', error);
      setError(error.message || 'ভিডিও প্রক্রিয়াকরণে সমস্যা হয়েছে।');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      setError(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setError('ক্যামেরা অ্যাক্সেস করতে সমস্যা হয়েছে।');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        try {
          const formData = new FormData();
          formData.append('file', blob, 'camera-capture.jpg');
          formData.append('confidence_threshold', confidenceThreshold.toString());

          const response = await api.post('/api/detection/detect-camera-frame', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          setCapturedImage({
            original: canvas.toDataURL(),
            processed: `data:image/jpeg;base64,${response.data.processed_image_b64}`,
            detections: response.data.detections,
            detection_count: response.data.detection_count
          });

        } catch (error: any) {
          console.error('Capture processing error:', error);
          setError(error.response?.data?.detail || 'ছবি প্রক্রিয়াকরণে সমস্যা হয়েছে।');
        } finally {
          setIsCapturing(false);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // Live Stream Functions
  const startLiveStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play();
      }

      // Connect to WebSocket
      const wsUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/detection/stream-camera?confidence_threshold=${confidenceThreshold}`;
      
      const ws = new WebSocket(wsUrl);
      setWebsocket(ws);

      ws.onopen = () => {
        setIsLiveStreaming(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.status === 'detection') {
            setLiveDetections(prev => [
              ...prev.slice(-4), // Keep last 5 detections
              {
                timestamp: new Date().toLocaleTimeString(),
                detections: data.detections,
                detection_count: data.detection_count,
                frame_b64: data.frame_b64
              }
            ]);
          } else if (data.status === 'error') {
            setError(data.error);
          }
        } catch (e) {
          console.error('WebSocket message parsing error:', e);
        }
      };

      ws.onclose = () => {
        setIsLiveStreaming(false);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('লাইভ স্ট্রিম সংযোগে সমস্যা হয়েছে।');
        setIsLiveStreaming(false);
      };

    } catch (error) {
      console.error('Live stream error:', error);
      setError('লাইভ স্ট্রিম শুরু করতে সমস্যা হয়েছে।');
    }
  };

  const stopLiveStream = () => {
    if (websocket) {
      websocket.send('stop');
      websocket.close();
      setWebsocket(null);
    }
    
    if (liveVideoRef.current?.srcObject) {
      const mediaStream = liveVideoRef.current.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => track.stop());
      liveVideoRef.current.srcObject = null;
    }
    
    setIsLiveStreaming(false);
    setLiveDetections([]);
  };

  const reset = () => {
    setSelectedFile(null);
    setSelectedVideo(null);
    setPreview(null);
    setVideoPreview(null);
    setResult(null);
    setVideoResult(null);
    setError(null);
    setCapturedImage(null);
    setVideoProgress(0);
    stopCamera();
    stopLiveStream();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'গুরুতর':
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'মাঝারি':
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'হালকা':
      case 'mild':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="image" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>ছবি</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>ভিডিও</span>
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>ক্যামেরা</span>
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>লাইভ</span>
          </TabsTrigger>
        </TabsList>

        {/* Image Detection Tab */}
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>ছবি আপলোড করুন</span>
              </CardTitle>
              <CardDescription>
                গাছের পাতার ছবি আপলোড করে রোগ শনাক্ত করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File upload area for images */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  handleFileSelect(file);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="space-y-4">
                    <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded" />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      নতুন ছবি
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">ছবি আপলোড করুন</p>
                      <p className="text-gray-500">অথবা এখানে ছেড়ে দিন</p>
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

              {/* Confidence threshold */}
              <div className="space-y-2">
                <label className="text-sm font-medium">আত্মবিশ্বাসের মাত্রা: {confidenceThreshold}</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Upload button */}
              <Button
                onClick={handleImageUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    প্রক্রিয়াকরণ...
                  </>
                ) : (
                  'রোগ শনাক্ত করুন'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Detection Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>ভিডিও আপলোড করুন</span>
              </CardTitle>
              <CardDescription>
                ভিডিও ফাইল আপলোড করে প্রতিটি ফ্রেমে রোগ শনাক্ত করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video upload area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
                onClick={() => videoInputRef.current?.click()}
              >
                {videoPreview ? (
                  <div className="space-y-4">
                    <video controls className="max-h-64 mx-auto rounded">
                      <source src={videoPreview} />
                    </video>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      নতুন ভিডিও
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Video className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">ভিডিও আপলোড করুন</p>
                      <p className="text-gray-500">MP4, AVI, MOV ফরম্যাট সাপোর্টেড</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoSelect(file);
                }}
                className="hidden"
              />

              {/* Progress bar for video processing */}
              {isProcessingVideo && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>প্রক্রিয়াকরণ...</span>
                    <span>{Math.round(videoProgress)}%</span>
                  </div>
                  <Progress value={videoProgress} className="w-full" />
                </div>
              )}

              {/* Upload button */}
              <Button
                onClick={handleVideoUpload}
                disabled={!selectedVideo || isProcessingVideo}
                className="w-full"
              >
                {isProcessingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    প্রক্রিয়াকরণ...
                  </>
                ) : (
                  'ভিডিও প্রক্রিয়া করুন'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Camera Tab */}
        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>ক্যামেরা ব্যবহার করুন</span>
              </CardTitle>
              <CardDescription>
                ক্যামেরা দিয়ে সরাসরি ছবি তুলে রোগ শনাক্ত করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCameraActive ? (
                <Button onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  ক্যামেরা চালু করুন
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={capturePhoto}
                      disabled={isCapturing}
                      className="flex-1"
                    >
                      {isCapturing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          প্রক্রিয়াকরণ...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          ছবি তুলুন
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      বন্ধ করুন
                    </Button>
                  </div>
                </div>
              )}

              {/* Captured image result */}
              {capturedImage && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">মূল ছবি</h4>
                      <img src={capturedImage.original} alt="Original" className="w-full rounded" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">প্রক্রিয়াকৃত ছবি</h4>
                      <img src={capturedImage.processed} alt="Processed" className="w-full rounded" />
                    </div>
                  </div>
                  
                  {capturedImage.detections?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">শনাক্তকৃত রোগ ({capturedImage.detection_count}টি):</h4>
                      {capturedImage.detections.map((detection, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{detection.class_name}</span>
                            <p className="text-sm text-gray-600">আত্মবিশ্বাস: {(detection.confidence * 100).toFixed(1)}%</p>
                          </div>
                          <Badge className={getSeverityColor(detection.severity)}>
                            {detection.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Stream Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>লাইভ স্ট্রিম</span>
              </CardTitle>
              <CardDescription>
                রিয়েল-টাইমে ক্যামেরা ফিড থেকে রোগ শনাক্তকরণ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLiveStreaming ? (
                <Button onClick={startLiveStream} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  লাইভ স্ট্রিম শুরু করুন
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={liveVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 text-white">
                        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </Badge>
                    </div>
                  </div>
                  
                  <Button onClick={stopLiveStream} variant="outline" className="w-full">
                    <Pause className="h-4 w-4 mr-2" />
                    স্ট্রিম বন্ধ করুন
                  </Button>

                  {/* Live detections */}
                  {liveDetections.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">সাম্প্রতিক শনাক্তকরণ:</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {liveDetections.slice().reverse().map((detection, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">{detection.timestamp}</span>
                              <Badge>{detection.detection_count}টি শনাক্ত</Badge>
                            </div>
                            {detection.detections.length > 0 && (
                              <div className="space-y-1">
                                {detection.detections.map((det, i) => (
                                  <div key={i} className="text-sm flex justify-between">
                                    <span>{det.class_name}</span>
                                    <span className="text-gray-600">{(det.confidence * 100).toFixed(1)}%</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Success Results */}
      <AnimatePresence>
        {(result || videoResult) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>শনাক্তকরণ সফল!</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <img src={result.original_image_url} alt="Original" className="w-full rounded" />
                      <img src={result.processed_image_url} alt="Processed" className="w-full rounded" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>মোট {result.detection_count}টি রোগ শনাক্ত হয়েছে</span>
                      <span className="text-sm text-gray-500">
                        প্রক্রিয়াকরণ সময়: {result.processing_time?.toFixed(2)}s
                      </span>
                    </div>

                    {result.detections?.map((detection, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{detection.class_name}</span>
                          <p className="text-sm text-gray-600">আত্মবিশ্বাস: {(detection.confidence * 100).toFixed(1)}%</p>
                        </div>
                        <Badge className={getSeverityColor(detection.severity)}>
                          {detection.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {videoResult && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>ভিডিও প্রক্রিয়াকরণ সম্পন্ন</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        ডাউনলোড
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold">{videoResult.total_frames}</div>
                        <div className="text-sm text-gray-600">মোট ফ্রেম</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold">{videoResult.processed_frames}</div>
                        <div className="text-sm text-gray-600">প্রক্রিয়াকৃত ফ্রেম</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold">{videoResult.total_detections}</div>
                        <div className="text-sm text-gray-600">মোট শনাক্তকরণ</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={reset} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    আবার চেষ্টা করুন
                  </Button>
                  {onSwitchToHistory && (
                    <Button onClick={onSwitchToHistory} className="flex-1">
                      ইতিহাস দেখুন
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoDetectionUpload;
