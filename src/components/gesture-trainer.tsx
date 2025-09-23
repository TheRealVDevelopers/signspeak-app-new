'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGestures } from '@/hooks/use-gestures';
import type { Landmark, LandmarkData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { WebcamView } from './webcam-view';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Camera, Trash2, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { validateGesture } from '@/ai/flows/gesture-validation-tool';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

const SAMPLES_REQUIRED = 20;

export function GestureTrainer() {
  const router = useRouter();
  const { gestures, addGesture, deleteGesture, isLoading: isGesturesLoading } = useGestures();
  const [gestureName, setGestureName] = useState('');
  const [capturedSamples, setCapturedSamples] = useState<LandmarkData[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastLandmarks, setLastLandmarks] = useState<LandmarkData>([]);
  const { toast } = useToast();

  const handleLandmarks = useCallback((landmarks: Landmark[], worldLandmarks: Landmark[]) => {
    // Using world landmarks for pose-invariance
    setLastLandmarks(worldLandmarks);
  }, []);

  const handleCapture = () => {
    if (lastLandmarks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Capture Failed',
        description: 'No hand detected. Please make sure your hand is visible.',
      });
      return;
    }
    if (capturedSamples.length < SAMPLES_REQUIRED) {
      setCapturedSamples(prev => [...prev, lastLandmarks]);
    }
  };

  const handleSaveGesture = async () => {
    if (gestureName.trim() === '') {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a name for the gesture.' });
      return;
    }
    if (capturedSamples.length < SAMPLES_REQUIRED) {
      toast({ variant: 'destructive', title: 'Error', description: `Please capture ${SAMPLES_REQUIRED} samples.` });
      return;
    }

    setIsSaving(true);
    const newGesture = { label: gestureName, samples: capturedSamples };
    
    const landmarkDataForValidation = newGesture.samples.map(sample => sample.flatMap(lm => [lm.x, lm.y, lm.z]));
    const trainedLandmarksForValidation = gestures.reduce((acc, g) => {
        acc[g.label] = g.samples.map(s => s.flatMap(lm => [lm.x, lm.y, lm.z]));
        return acc;
    }, {} as Record<string, number[][]>);

    try {
        const validationResult = await validateGesture({
            gestureName: newGesture.label,
            landmarkData: landmarkDataForValidation,
            trainedLandmarks: trainedLandmarksForValidation,
        });

        if (validationResult.isValid && validationResult.confidence > 0.7) {
            await addGesture(newGesture);
            toast({
                title: 'Gesture Saved!',
                description: `${gestureName} has been trained successfully. Confidence: ${(validationResult.confidence * 100).toFixed(0)}%`,
            });
            setGestureName('');
            setCapturedSamples([]);
        } else {
            toast({
                variant: 'destructive',
                title: 'Validation Failed',
                description: `Try again with clearer movements. Confidence: ${(validationResult.confidence * 100).toFixed(0)}%`,
            });
        }
    } catch (error) {
        console.error("Validation error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during gesture validation.' });
    } finally {
        setIsSaving(false);
    }
  };

  const startCapturing = () => setIsCapturing(true);

  const progress = (capturedSamples.length / SAMPLES_REQUIRED) * 100;
  
  useEffect(() => {
    if(!isCapturing) {
        startCapturing();
    }
  }, [isCapturing]);

  return (
    <div className="container py-8 grid lg:grid-cols-2 gap-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Train New Gesture</CardTitle>
          <CardDescription>Capture {SAMPLES_REQUIRED} samples of a gesture for the AI to learn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WebcamView onLandmarks={handleLandmarks} isCapturing={isCapturing} className="w-full aspect-video" />
          
          <div className="space-y-2 pt-4">
            <Input
              placeholder="Enter word (e.g., Hello)"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              disabled={isSaving || !isCapturing}
            />
            <div className="flex items-center gap-4">
              <Button onClick={handleCapture} disabled={!isCapturing || capturedSamples.length >= SAMPLES_REQUIRED || isSaving || !gestureName} className="flex-1">
                <Camera className="mr-2" /> Capture Sample
              </Button>
              <Progress value={progress} className="w-1/2" />
              <span className="text-sm text-muted-foreground">{capturedSamples.length}/{SAMPLES_REQUIRED}</span>
            </div>
          </div>
          
          {capturedSamples.length >= SAMPLES_REQUIRED && (
            <Alert className="border-primary bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
              <AlertTitle>Ready to Save!</AlertTitle>
              <AlertDescription>
                You have captured enough samples. Click "Save Gesture" to train the model.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSaveGesture} disabled={capturedSamples.length < SAMPLES_REQUIRED || isSaving || !isCapturing || !gestureName} className="w-full" size="lg">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Gesture
          </Button>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Trained Gestures</CardTitle>
            <CardDescription>A list of all gestures you have trained.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGesturesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : gestures.length > 0 ? (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-4">
                  {gestures.map((gesture) => (
                    <div key={gesture.label} className="flex items-center justify-between p-2 rounded-lg bg-background hover:bg-secondary transition-colors">
                      <p className="font-medium">{gesture.label}</p>
                      <Button variant="ghost" size="icon" onClick={() => deleteGesture(gesture.label)} aria-label={`Delete ${gesture.label}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-muted-foreground text-center py-8">No gestures trained yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={() => router.push('/detect')} disabled={gestures.length === 0}>
              Go to Detection Page <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
