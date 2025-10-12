
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Gesture, Landmark } from '@/lib/types';
import { WebcamView } from './webcam-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { gestureDB } from '@/lib/db';
import { Skeleton } from './ui/skeleton';
import { BarChart, Hand, History, MessageSquare, Play, Square } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { SentenceDetector } from './sentence-detector';

const CONFIDENCE_THRESHOLD = 0.8;
const FRAME_CONSISTENCY_COUNT = 3;
const DETECTION_INTERVAL_MS = 50; 

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
  if (nearestNeighbors.length === 0) return {label: 'Unknown', confidence: 0};
  
  const neighborCounts: {[label: string]: number} = {};
  nearestNeighbors.forEach(n => neighborCounts[n.label] = (neighborCounts[n.label] || 0) + 1);

  let predictedLabel = '';
  let maxCount = 0;
  for (const label in neighborCounts) {
    if (neighborCounts[label] > maxCount) {
      predictedLabel = label;
      maxCount = neighborCounts[label];
    }
  }

  const confidence = maxCount / k;
  return {label: predictedLabel, confidence};
}

function verifyMultiFrameConsistency(
    detectedGestures: string[],
    requiredConsistency: number
): { isValidGesture: boolean; consistentGesture?: string } {
    if (detectedGestures.length < requiredConsistency) return { isValidGesture: false };
    const lastGestures = detectedGestures.slice(-requiredConsistency);
    const firstGesture = lastGestures[0];
    const isConsistent = lastGestures.every(g => g === firstGesture);
    return { isValidGesture: isConsistent, consistentGesture: isConsistent ? firstGesture : undefined };
}

export function GestureDetector() {
  const [trainedGestures, setTrainedGestures] = useState<Gesture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const [wordResult, setWordResult] = useState<{ label: string; confidence: number } | null>(null);
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [sentenceResult, setSentenceResult] = useState<{ label: string; confidence: number } | null>(null);
  
  const recentDetectionsRef = useRef<string[]>([]);
  const landmarkBufferRef = useRef<Landmark[][]>([]);
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
          description: 'Please go to the training page to add words or sentences first.',
          duration: 5000,
        });
      }
    };
    loadGestures();
  }, [toast]);

  const handleWordDetection = useCallback((landmarks: Landmark[]) => {
    if (trainedGestures.length === 0) return;

    const knnResult = kNearestNeighbors(landmarks, trainedGestures, 3);
    
    if (knnResult.confidence > CONFIDENCE_THRESHOLD && knnResult.label !== 'No gestures trained' && knnResult.label !== 'Unknown') {
        recentDetectionsRef.current.push(knnResult.label);
        if (recentDetectionsRef.current.length > FRAME_CONSISTENCY_COUNT * 2) {
            recentDetectionsRef.current.shift();
        }

        const verificationResult = verifyMultiFrameConsistency(recentDetectionsRef.current, FRAME_CONSISTENCY_COUNT);
        
        if (verificationResult.isValidGesture && verificationResult.consistentGesture) {
             if (wordResult?.label !== verificationResult.consistentGesture) {
                setWordResult({ label: verificationResult.consistentGesture, confidence: knnResult.confidence });
                setWordHistory(prev => [verificationResult.consistentGesture!, ...prev].slice(0, 5));
                recentDetectionsRef.current = [];
             }
        }
    } else {
       if (recentDetectionsRef.current.length > 0) recentDetectionsRef.current.shift();
    }
  }, [trainedGestures, wordResult]);

  const handleLandmarks = useCallback((landmarks: Landmark[], worldLandmarks: Landmark[]) => {
    if (!isDetecting) {
        setWordResult(null);
        setSentenceResult(null);
        landmarkBufferRef.current = [];
        return;
    }
    if (worldLandmarks.length === 0) return;

    const now = Date.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
        return;
    }
    lastDetectionTimeRef.current = now;

    const normalizedLandmarks = normalizeLandmarks(worldLandmarks);
    handleWordDetection(normalizedLandmarks);

    // Add to sentence detection buffer
    landmarkBufferRef.current.push(normalizedLandmarks);
  }, [isDetecting, handleWordDetection]);

  const handleSentenceDetection = useCallback((result: {label: string, confidence: number} | null) => {
    if (result) {
        setSentenceResult(result);
        // Clear word result if a sentence is found to avoid confusion
        setWordResult(null); 
    }
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-4 md:p-6">
      <div className="lg:col-span-2 space-y-4">
        <WebcamView onLandmarks={handleLandmarks} isCapturing={isDetecting} className="w-full aspect-video" />
         <Button onClick={() => setIsDetecting(!isDetecting)} size="lg" className="w-full" disabled={isLoading}>
          {isDetecting ? <><Square className="mr-2" />Stop Detection</> : <><Play className="mr-2" />Start Detection</>}
        </Button>
      </div>
      <div className="space-y-8">
        <Card className="glass-card h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Hand /> Detected Word
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center min-h-[120px] flex flex-col justify-center items-center">
            {isLoading ? ( <Skeleton className="w-3/4 h-16" /> ) 
            : !isDetecting ? ( <p className="text-xl text-muted-foreground">Press Start to Detect</p> )
            : wordResult ? (
              <>
                <p className="text-5xl font-bold text-primary truncate">{wordResult.label}</p>
                <Badge variant="secondary" className="mt-4 flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  Confidence: {(wordResult.confidence * 100).toFixed(0)}%
                </Badge>
              </>
            ) : !sentenceResult ? (
              <p className="text-xl text-muted-foreground">Show a trained gesture...</p>
            ) : (
              <p className="text-xl text-muted-foreground">-</p>
            )}
          </CardContent>
        </Card>
        
        <SentenceDetector 
          isDetecting={isDetecting} 
          landmarkBufferRef={landmarkBufferRef} 
          onDetection={handleSentenceDetection}
          result={sentenceResult}
        />

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <History /> Word History
            </CardTitle>
            <CardDescription>Last 5 recognized words.</CardDescription>
          </CardHeader>
          <CardContent>
            {wordHistory.length > 0 ? (
              <ul className="space-y-2">
                {wordHistory.map((item, index) => (
                  <li key={index} className={`p-3 rounded-md transition-all duration-300 ${index === 0 ? 'bg-primary/20 font-semibold' : 'bg-secondary/20'}`}>
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
