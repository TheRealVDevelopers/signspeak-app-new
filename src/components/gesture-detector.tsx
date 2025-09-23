'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Gesture, Landmark } from '@/lib/types';
import { WebcamView } from './webcam-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { gestureDB } from '@/lib/db';
import { knnGestureRecognition } from '@/ai/flows/knn-gesture-recognition';
import { verifyMultiFrameConsistency } from '@/ai/flows/multi-frame-verification';
import { Skeleton } from './ui/skeleton';
import { BarChart, Hand, History } from 'lucide-react';
import { Badge } from './ui/badge';

const CONFIDENCE_THRESHOLD = 0.8;
const FRAME_CONSISTENCY_COUNT = 3;
const DETECTION_INTERVAL_MS = 100;

export function GestureDetector() {
  const [trainedGestures, setTrainedGestures] = useState<Gesture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(true);
  
  const [detectionResult, setDetectionResult] = useState<{ label: string; confidence: number } | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<string[]>([]);
  
  const recentDetectionsRef = useRef<string[]>([]);
  const lastDetectionTimeRef = useRef(0);
  const { toast } = useToast();

  useEffect(() => {
    const loadGestures = async () => {
      setIsLoading(true);
      const gestures = await gestureDB.getAll();
      setTrainedGestures(gestures);
      setIsLoading(false);
      if (gestures.length === 0) {
        toast({
          title: 'No Gestures Trained',
          description: 'Please go to the training page to add gestures first.',
          duration: 5000,
        });
      }
    };
    loadGestures();
  }, [toast]);

  const handleDetection = useCallback(async (landmarks: Landmark[]) => {
    if (landmarks.length === 0 || trainedGestures.length === 0 || !isDetecting) {
      return;
    }

    const now = Date.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
        return;
    }
    lastDetectionTimeRef.current = now;

    const formattedTrainedGestures = trainedGestures.map(g => ({
        label: g.label,
        samples: g.samples.map(sample => sample.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))),
    }));

    try {
      const knnResult = await knnGestureRecognition({
        landmarks,
        trainedGestures: formattedTrainedGestures,
      });

      if (knnResult.recognizedGesture !== 'No gestures trained' && knnResult.confidence > CONFIDENCE_THRESHOLD) {
        recentDetectionsRef.current.push(knnResult.recognizedGesture);
        if (recentDetectionsRef.current.length > FRAME_CONSISTENCY_COUNT) {
          recentDetectionsRef.current.shift();
        }

        if (recentDetectionsRef.current.length === FRAME_CONSISTENCY_COUNT) {
          const verificationResult = await verifyMultiFrameConsistency({
            detectedGestures: recentDetectionsRef.current,
            requiredConsistency: FRAME_CONSISTENCY_COUNT,
          });

          if (verificationResult.isValidGesture && verificationResult.consistentGesture) {
            if (detectionResult?.label !== verificationResult.consistentGesture) {
              setDetectionResult({ label: verificationResult.consistentGesture, confidence: knnResult.confidence });
              setDetectionHistory(prev => [verificationResult.consistentGesture!, ...prev].slice(0, 5));
            }
          }
        }
      } else {
        recentDetectionsRef.current = [];
      }
    } catch (error) {
      console.error('Detection error:', error);
      setIsDetecting(false); // Stop detection on error
    }
  }, [trainedGestures, isDetecting, detectionResult]);

  const handleLandmarks = useCallback((landmarks: Landmark[], worldLandmarks: Landmark[]) => {
    handleDetection(worldLandmarks);
  }, [handleDetection]);

  return (
    <div className="container py-8 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <WebcamView onLandmarks={handleLandmarks} isCapturing={isDetecting} className="w-full aspect-video shadow-lg" />
      </div>
      <div className="space-y-8">
        <Card className="shadow-lg h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
              <Hand /> Detected Gesture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center min-h-[150px] flex flex-col justify-center items-center">
            {isLoading ? (
                <Skeleton className="w-3/4 h-16" />
            ) : trainedGestures.length === 0 ? (
                 <p className="text-xl text-muted-foreground">Go to Train Page</p>
            ) : detectionResult ? (
              <>
                <p className="text-5xl font-bold font-headline text-primary truncate">{detectionResult.label}</p>
                <Badge variant="secondary" className="mt-4 flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  Confidence: {(detectionResult.confidence * 100).toFixed(0)}%
                </Badge>
              </>
            ) : (
              <p className="text-xl text-muted-foreground">Show a trained gesture...</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
              <History /> Detection History
            </CardTitle>
            <CardDescription>Last 5 recognized gestures.</CardDescription>
          </CardHeader>
          <CardContent>
            {detectionHistory.length > 0 ? (
              <ul className="space-y-2">
                {detectionHistory.map((item, index) => (
                  <li key={index} className={`p-3 rounded-md transition-all duration-300 ${index === 0 ? 'bg-primary/20 font-semibold' : 'bg-secondary'}`}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No detections yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
