
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';

type WebcamCaptureProps = {
  onFrame: (imageSrc: string) => void;
  enabled: boolean;
};

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onFrame, enabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (enabled) {
      startCamera();
    } else if (streamRef.current) {
      stopCamera();
    }

    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, [enabled]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Function to capture a frame from the video stream
  const captureFrame = () => {
    if (videoRef.current && isStreaming) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageSrc = canvas.toDataURL('image/jpeg');
        onFrame(imageSrc);
      }
    }
  };

  // Set up interval to capture frames when streaming is active
  useEffect(() => {
    let frameInterval: number | undefined;
    
    if (isStreaming && enabled) {
      frameInterval = window.setInterval(() => {
        captureFrame();
      }, 1000) as unknown as number; // Capture a frame every second
    }
    
    return () => {
      if (frameInterval) {
        clearInterval(frameInterval);
      }
    };
  }, [isStreaming, enabled]);

  return (
    <div className="relative rounded-lg overflow-hidden">
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-auto ${isStreaming ? 'block' : 'hidden'}`}
      />
      
      {!isStreaming && enabled && (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg">
          <p className="text-center mb-4">Camera access required</p>
          <Button onClick={startCamera}>Enable Camera</Button>
        </div>
      )}
      
      {!enabled && (
        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
          <p className="text-center">Please select a real-time detection model first</p>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
