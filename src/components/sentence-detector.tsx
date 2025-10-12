
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSentences } from '@/hooks/use-sentences';
import type { Landmark, LandmarkData, Sentence } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, MessageSquare } from 'lucide-react';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const SEQUENCE_BUFFER_SIZE = 50; // Approx 5 seconds of gestures (50 frames * 100ms)
const DETECTION_INTERVAL_MS = 1000; // Run detection every second
const DTW_THRESHOLD = 0.5;

interface SentenceDetectorProps {
  isDetecting: boolean;
  landmarkBufferRef: React.RefObject<LandmarkData[]>;
  onDetection: (result: { label: string; confidence: number } | null) => void;
  result: { label: string; confidence: number } | null;
}

// Simple euclidean distance between two landmark sets
function landmarkDistance(frame1: LandmarkData, frame2: LandmarkData): number {
    let distance = 0;
    for (let i = 0; i < Math.min(frame1.length, frame2.length); i++) {
        const dx = frame1[i].x - frame2[i].x;
        const dy = frame1[i].y - frame2[i].y;
        const dz = frame1[i].z - frame2[i].z;
        distance += Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
    return distance / frame1.length;
}

// Dynamic Time Warping implementation
function dtw(seq1: LandmarkData[], seq2: LandmarkData[]): number {
    const n = seq1.length;
    const m = seq2.length;
    const dtwMatrix = Array(n + 1).fill(null).map(() => Array(m + 1).fill(Infinity));
    dtwMatrix[0][0] = 0;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = landmarkDistance(seq1[i - 1], seq2[j - 1]);
            dtwMatrix[i][j] = cost + Math.min(
                dtwMatrix[i - 1][j],       // Insertion
                dtwMatrix[i][j - 1],       // Deletion
                dtwMatrix[i - 1][j - 1]    // Match
            );
        }
    }
    return dtwMatrix[n][m] / (n + m); // Normalize path length
}

export function SentenceDetector({ isDetecting, landmarkBufferRef, onDetection, result }: SentenceDetectorProps) {
  const { sentences, isLoading: isSentencesLoading } = useSentences();
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const runDetection = useCallback(() => {
    if (!isDetecting || isSentencesLoading || sentences.length === 0 || !landmarkBufferRef.current) {
        return;
    }
    
    let currentSequence = landmarkBufferRef.current;
    if (currentSequence.length > SEQUENCE_BUFFER_SIZE) {
        currentSequence = currentSequence.slice(-SEQUENCE_BUFFER_SIZE);
        landmarkBufferRef.current = currentSequence;
    }

    if (currentSequence.length < 10) return; // Not enough data to be a sentence

    let bestMatch: { label: string; score: number } = { label: 'Unknown', score: Infinity };

    for (const sentence of sentences) {
        for (const trainedSample of sentence.samples) {
            const score = dtw(currentSequence, trainedSample);
            if (score < bestMatch.score) {
                bestMatch = { label: sentence.label, score };
            }
        }
    }

    if (bestMatch.score < DTW_THRESHOLD) {
        const confidence = Math.max(0, 1 - (bestMatch.score / DTW_THRESHOLD));
        onDetection({ label: bestMatch.label, confidence });
        // Clear buffer after a successful detection to start fresh
        landmarkBufferRef.current = [];
    } else {
        onDetection(null);
    }
  }, [isDetecting, isSentencesLoading, sentences, landmarkBufferRef, onDetection]);

  useEffect(() => {
    if (isDetecting) {
      detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL_MS);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isDetecting, runDetection]);

  return (
    <Card className="glass-card h-fit">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageSquare /> Detected Sentence
            </CardTitle>
        </CardHeader>
        <CardContent className="text-center min-h-[120px] flex flex-col justify-center items-center">
            {isSentencesLoading ? ( <Skeleton className="w-3/4 h-16" /> )
            : !isDetecting ? ( <p className="text-xl text-muted-foreground">Detection stopped</p> )
            : result ? (
              <>
                <p className="text-4xl font-bold text-accent truncate">{result.label}</p>
                <Badge variant="default" className="mt-4 flex items-center gap-1 bg-accent/80">
                  <BarChart className="h-4 w-4" />
                  Confidence: {(result.confidence * 100).toFixed(0)}%
                </Badge>
              </>
            ) : (
              <p className="text-xl text-muted-foreground">Listening for sentences...</p>
            )}
        </CardContent>
    </Card>
  );
}
