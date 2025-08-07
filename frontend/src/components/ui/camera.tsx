'use client'

import { useState, useRef, useEffect } from 'react';
import { Camera, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraComponentProps {
  onCapture: (imageBlob: Blob) => void;
  isProcessing?: boolean;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture, isProcessing = false }) => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      setIsActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('ক্যামেরা অ্যাক্সেস করতে সমস্যা হয়েছে।');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-4">
      {!isActive ? (
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
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
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
    </div>
  );
};

export default CameraComponent;
