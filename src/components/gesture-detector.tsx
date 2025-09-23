'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Gesture, Landmark } from '@/lib/types';
import { WebcamView } from './webcam-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { gestureDB } from '@/lib/db';
import { Skeleton } from './ui/skeleton';
import { BarChart, Hand, History } from 'lucide-react';
import { Badge } from './ui/badge';

const CONFIDENCE_THRESHOLD = 0.8;
const FRAME_CONSISTENCY_COUNT = 3;
const DETECTION_INTERVAL_MS = 50; // Reduced for faster detection

// Simple KNN implementation moved to client-side for speed
function kNearestNeighbors(
  inputLandmarks: Landmark[],
  trainedGestures: {label: string; samples: Landmark[][]}[],
  k: number = 3
): {label: string; confidence: number} {
  if (!trainedGestures || trainedGestures.length === 0) {
    return {label: 'No gestures trained', confidence: 0};
  }

  const distances: {label: string; distance: number}[] = [];
  const normalizedInput = normalizeLandmarks(inputLandmarks);

  for (const gesture of trainedGestures) {
    for (const sample of gesture.samples) {
      const normalizedSample = normalizeLandmarks(sample);
      let totalDistance = 0;
      for (let i = 0; i < Math.min(normalizedInput.length, normalizedSample.length); i++) {
        const dx = normalizedInput[i].x - normalizedSample[i].x;
        const dy = normalizedInput[i].y - normalizedSample[i].y;
        const dz = normalizedInput[i].z - normalizedSample[i].z;
        totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      distances.push({label: gesture.label, distance: totalDistance / normalizedInput.length });
    }
  }

  distances.sort((a, b) => a.distance - b.distance);

  const nearestNeighbors = distances.slice(0, k);

  if (nearestNeighbors.length === 0) {
      return {label: 'Unknown', confidence: 0};
  }
  
  const neighborCounts: {[label: string]: number} = {};
  for (const neighbor of nearestNeighbors) {
    neighborCounts[neighbor.label] = (neighborCounts[neighbor.label] || 0) + 1;
  }

  let predictedLabel = '';
  let maxCount = 0;
  for (const label in neighborCounts) {
    if (neighborCounts[label] > maxCount) {
      predictedLabel = label;
      maxCount = neighborCounts[label];
    }
  }

  const confidence = maxCount / k;

  return {label: predictedLabel, confidence: confidence};
}

// Multi-frame verification moved to client-side
function verifyMultiFrameConsistency(
    detectedGestures: string[],
    requiredConsistency: number
): { isValidGesture: boolean; consistentGesture?: string } {
    if (detectedGestures.length < requiredConsistency) {
        return { isValidGesture: false };
    }
    const lastGestures = detectedGestures.slice(-requiredConsistency);
    const firstGesture = lastGestures[0];
    const isConsistent = lastGestures.every(g => g === firstGesture);
    
    if (isConsistent) {
        return { isValidGesture: true, consistentGesture: firstGesture };
    }
    return { isValidGesture: false };
}


function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
    if (landmarks.length === 0) return [];

    const centroid = landmarks.reduce((acc, lm) => ({
        x: acc.x + lm.x,
        y: acc.y + lm.y,
        z: acc.z + lm.z,
    }), { x: 0, y: 0, z: 0 });

    centroid.x /= landmarks.length;
    centroid.y /= landmarks.length;
    centroid.z /= landmarks.length;

    let maxDist = 0;
    for (const lm of landmarks) {
        const dist = Math.sqrt(
            Math.pow(lm.x - centroid.x, 2) +
            Math.pow(lm.y - centroid.y, 2) +
            Math.pow(lm.z - centroid.z, 2)
        );
        if (dist > maxDist) {
            maxDist = dist;
        }
    }

    if (maxDist === 0) return landmarks.map(() => ({ x: 0, y: 0, z: 0 }));

    return landmarks.map(lm => ({
        x: (lm.x - centroid.x) / maxDist,
        y: (lm.y - centroid.y) / maxDist,
        z: (lm.z - centroid.z) / maxDist,
    }));
}


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

  const handleDetection = useCallback((landmarks: Landmark[]) => {
    if (landmarks.length === 0 || trainedGestures.length === 0 || !isDetecting) {
      return;
    }

    const now = Date.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
        return;
    }
    lastDetectionTimeRef.current = now;

    const knnResult = kNearestNeighbors(landmarks, trainedGestures);

    if (knnResult.recognizedGesture !== 'No gestures trained' && knnResult.confidence > CONFIDENCE_THRESHOLD) {
      recentDetectionsRef.current.push(knnResult.recognizedGesture);
      if (recentDetectionsRef.current.length > FRAME_CONSISTENCY_COUNT * 2) { // Keep a bit more history
        recentDetectionsRef.current.shift();
      }

      if (recentDetectionsRef.current.length >= FRAME_CONSISTENCY_COUNT) {
        const verificationResult = verifyMultiFrameConsistency(
            recentDetectionsRef.current,
            FRAME_CONSISTENCY_COUNT
        );

        if (verificationResult.isValidGesture && verificationResult.consistentGesture) {
          if (detectionResult?.label !== verificationResult.consistentGesture) {
            setDetectionResult({ label: verificationResult.consistentGesture, confidence: knnResult.confidence });
            setDetectionHistory(prev => [verificationResult.consistentGesture!, ...prev].slice(0, 5));
            recentDetectionsRef.current = []; // Clear buffer after a successful detection
          }
        }
      }
    } else {
      // If confidence is low, start clearing the buffer
      if(recentDetectionsRef.current.length > 0) {
        recentDetectionsRef.current.shift();
      }
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
