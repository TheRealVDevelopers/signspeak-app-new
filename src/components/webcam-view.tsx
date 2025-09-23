'use client';

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Landmark } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface WebcamViewProps {
  onLandmarks: (landmarks: Landmark[], worldLandmarks: Landmark[]) => void;
  isCapturing: boolean;
  className?: string;
}

let handLandmarker: HandLandmarker | undefined = undefined;

export function WebcamView({ onLandmarks, isCapturing, className }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const onLandmarksRef = useRef(onLandmarks);
  onLandmarksRef.current = onLandmarks;

  useEffect(() => {
    let stream: MediaStream | null = null;
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `/models/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load webcam or model. Please grant permissions and refresh.',
        });
        setIsLoading(false);
      }
    };

    init();

    return () => {
      handLandmarker?.close();
      handLandmarker = undefined;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;
    let lastVideoTime = -1;

    const predictWebcam = () => {
      if (
        !handLandmarker ||
        !videoRef.current ||
        !canvasRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended
      ) {
        if(isCapturing) animationFrameId = requestAnimationFrame(predictWebcam);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
      if (!canvasCtx) return;

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = handLandmarker.detectForVideo(video, Date.now());
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        if (results.landmarks.length > 0) {
          onLandmarksRef.current(results.landmarks[0], results.worldLandmarks[0] || []);
          for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: 'hsl(var(--primary))', lineWidth: 5 });
            drawLandmarks(canvasCtx, landmarks, { color: 'hsl(var(--accent))', lineWidth: 2, radius: 4 });
          }
        } else {
          onLandmarksRef.current([], []);
        }
        canvasCtx.restore();
      }
      if(isCapturing) animationFrameId = requestAnimationFrame(predictWebcam);
    };

    if (isCapturing && !isLoading) {
      predictWebcam();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isCapturing, isLoading]);

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-muted', className)}>
      {isLoading && <Skeleton className="absolute inset-0 z-20" />}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover transform -scale-x-100"
      ></video>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100"
      ></canvas>
    </div>
  );
}
