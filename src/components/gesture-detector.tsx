
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Gesture, Landmark, SentenceGesture } from '@/lib/types';
import { WebcamView } from './webcam-view';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { gestureDB, sentenceDB } from '@/lib/db';
import { Skeleton } from './ui/skeleton';
import { BarChart, Hand, History, MessageSquare, Play, Square } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useSentences } from '@/hooks/use-sentences';

const CONFIDENCE_THRESHOLD = 0.8;
const SEQUENCE_TIMEOUT_MS = 7000;
const DETECTION_INTERVAL_MS = 100;
const SENTENCE_COOLDOWN_MS = 3000; // Cooldown period after sentence detection

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
  trainedGestures: (Gesture | SentenceGesture)[],
  k: number = 3
): {label: string; confidence: number} {
  if (!trainedGestures || trainedGestures.length === 0) {
    return {label: 'Unknown', confidence: 0};
  }

  const distances: {label: string; distance: number}[] = [];
  const normalizedInput = normalizeLandmarks(inputLandmarks);

  for (const gesture of trainedGestures) {
    if (!gesture || !gesture.samples) continue;
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

  let predictedLabel = 'Unknown';
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


export function GestureDetector() {
  const [trainedWords, setTrainedWords] = useState<Gesture[]>([]);
  const { sentences: trainedSentences, isLoading: isSentencesLoading } = useSentences();
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const [wordResult, setWordResult] = useState<{ label: string; confidence: number } | null>(null);
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [sentenceResult, setSentenceResult] = useState<string | null>(null);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTimeRef = useRef(0);
  const lastRecognizedWordRef = useRef<{ label: string, timestamp: number } | null>(null);
  const sentenceCooldownEndRef = useRef(0);


  const { toast } = useToast();

  const allTrainedGestures = trainedSentences.flatMap(s => s.gestures).filter(Boolean);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const words = await gestureDB.getAll();
      const sentences = await sentenceDB.getAll();
      setTrainedWords(words);
      setIsLoading(false);
      if (words.length === 0 && sentences.length === 0) {
        toast({
          title: 'No Gestures Trained',
          description: 'Please go to the training page to add words or sentences first.',
          duration: 5000,
        });
      }
    };
    loadData();
  }, [toast]);

  const resetSequence = useCallback(() => {
    setCurrentSequence([]);
    if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = null;
    }
  }, []);

  const handleDetection = useCallback((landmarks: Landmark[]) => {
    if (trainedWords.length === 0 && allTrainedGestures.length === 0) return;
    
    const now = Date.now();
    if (now < sentenceCooldownEndRef.current) {
        return;
    }

    const combinedGestureSet = [...trainedWords, ...allTrainedGestures].filter(Boolean);
    const knnResult = kNearestNeighbors(landmarks, combinedGestureSet, 3);
    
    if (knnResult.confidence > CONFIDENCE_THRESHOLD && knnResult.label !== 'Unknown') {
        if (lastRecognizedWordRef.current?.label === knnResult.label && now - lastRecognizedWordRef.current.timestamp < 1000) {
            return;
        }

        setWordResult({ label: knnResult.label, confidence: knnResult.confidence });
        setWordHistory(prev => [knnResult.label, ...prev].slice(0, 5));
        lastRecognizedWordRef.current = { label: knnResult.label, timestamp: now };

        const newSequence = [...currentSequence, knnResult.label];
        setCurrentSequence(newSequence);
        
        if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
        sequenceTimeoutRef.current = setTimeout(resetSequence, SEQUENCE_TIMEOUT_MS);

        for (const sentence of trainedSentences) {
            if (sentence.gestures && newSequence.length >= sentence.gestures.length) {
                const sequenceToCheck = newSequence.slice(-sentence.gestures.length);
                const isMatch = sentence.gestures.every((g, i) => g.label === sequenceToCheck[i]);
                
                if (isMatch) {
                    setSentenceResult(sentence.label);
                    setWordResult(null);
                    resetSequence();
                    sentenceCooldownEndRef.current = Date.now() + SENTENCE_COOLDOWN_MS;
                    return;
                }
            }
        }
    }
  }, [trainedWords, allTrainedGestures, currentSequence, trainedSentences, resetSequence]);


  const handleLandmarks = useCallback((landmarks: Landmark[], worldLandmarks: Landmark[]) => {
    if (!isDetecting) {
        setWordResult(null);
        setSentenceResult(null);
        resetSequence();
        return;
    }
    if (worldLandmarks.length === 0) return;

    const now = Date.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
        return;
    }
    lastDetectionTimeRef.current = now;

    const normalizedLandmarks = normalizeLandmarks(worldLandmarks);
    handleDetection(normalizedLandmarks);
  }, [isDetecting, handleDetection, resetSequence]);

  useEffect(() => {
    if(sentenceResult) {
        const timer = setTimeout(() => setSentenceResult(null), SENTENCE_COOLDOWN_MS);
        return () => clearTimeout(timer);
    }
  }, [sentenceResult]);

  const isLoadingData = isLoading || isSentencesLoading;

  return (
    <div className="grid lg:grid-cols-3 gap-8 p-4 md:p-6">
      <div className="lg:col-span-2 space-y-4">
        <WebcamView onLandmarks={handleLandmarks} isCapturing={isDetecting} className="w-full aspect-video" />
         <Button onClick={() => setIsDetecting(!isDetecting)} size="lg" className="w-full" disabled={isLoadingData}>
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
            {isLoadingData ? ( <Skeleton className="w-3/4 h-16" /> ) 
            : !isDetecting ? ( <p className="text-xl text-muted-foreground">Press Start to Detect</p> )
            : wordResult && !sentenceResult ? (
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
        
        <Card className="glass-card h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <MessageSquare /> Detected Sentence
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center min-h-[120px] flex flex-col justify-center items-center">
                {isLoadingData ? ( <Skeleton className="w-3/4 h-16" /> )
                : !isDetecting ? ( <p className="text-xl text-muted-foreground">Detection stopped</p> )
                : sentenceResult ? (
                  <>
                    <p className="text-4xl font-bold text-accent truncate">{sentenceResult}</p>
                  </>
                ) : (
                  <p className="text-xl text-muted-foreground">Listening for sentences...</p>
                )}
            </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <History /> Word History
            </CardTitle>
            <CardDescription>Last 5 recognized words. Current sequence is shown at the top.</CardDescription>
          </CardHeader>
          <CardContent>
             {isDetecting && currentSequence.length > 0 && (
                <div className="mb-4 p-3 rounded-md bg-primary/10">
                    <p className="text-sm font-semibold text-primary-foreground/80">Current Sequence:</p>
                    <p className="text-lg font-medium text-primary-foreground">{currentSequence.join(' → ')}</p>
                </div>
            )}
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
