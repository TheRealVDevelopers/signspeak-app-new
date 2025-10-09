'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGestures } from '@/hooks/use-gestures';
import type { Landmark, LandmarkData, Gesture } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { WebcamView } from './webcam-view';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Camera, Trash2, Loader2, CheckCircle, ArrowRight, X, Book, MessageSquare, BookOpen } from 'lucide-react';
import { validateGesture } from '@/ai/flows/gesture-validation-tool';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SAMPLES_REQUIRED = 30; // Increased for better accuracy

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


function WordTrainer({ gestures, addGesture, isSaving, setIsSaving, onIsCapturingChange, lastLandmarks, isCapturing }) {
  const [gestureName, setGestureName] = useState('');
  const [gestureDescription, setGestureDescription] = useState('');
  const [capturedSamples, setCapturedSamples] = useState<LandmarkData[]>([]);
  const { toast } = useToast();

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

  const handleDeleteSample = (index: number) => {
    setCapturedSamples(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSaveGesture = async () => {
    if (gestureName.trim() === '') {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a name for the gesture.' });
      return;
    }
     if (gestureDescription.trim() === '') {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a description for the gesture.' });
      return;
    }
    if (capturedSamples.length < SAMPLES_REQUIRED) {
      toast({ variant: 'destructive', title: 'Error', description: `Please capture ${SAMPLES_REQUIRED} samples.` });
      return;
    }

    setIsSaving(true);

    const normalizedSamples = capturedSamples.map(sample => normalizeLandmarks(sample));
    const newGesture: Gesture = { label: gestureName, description: gestureDescription, samples: normalizedSamples, type: 'word' };
    
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

        if (validationResult.isValid) {
            await addGesture(newGesture);
            toast({
                title: 'Gesture Saved!',
                description: `${gestureName} has been trained successfully.`,
            });
            setGestureName('');
            setGestureDescription('');
            setCapturedSamples([]);
        } else {
            toast({
                variant: 'destructive',
                title: 'Validation Failed',
                description: `This gesture name already exists. Please choose a different name.`,
            });
        }
    } catch (error) {
        console.error("Validation error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during gesture validation.' });
    } finally {
        setIsSaving(false);
    }
  };

  useEffect(() => {
    onIsCapturingChange(true);
  }, [onIsCapturingChange]);

  const progress = (capturedSamples.length / SAMPLES_REQUIRED) * 100;

  return (
    <CardContent className="space-y-4 pt-6">
      <div className="space-y-2">
        <Input
          placeholder="Enter word (e.g., Hello)"
          value={gestureName}
          onChange={(e) => setGestureName(e.target.value)}
          disabled={isSaving || !isCapturing}
        />
         <Textarea
          placeholder="Describe how to make the gesture..."
          value={gestureDescription}
          onChange={(e) => setGestureDescription(e.target.value)}
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

      {capturedSamples.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Captured Samples</h3>
          <ScrollArea className="h-24">
            <div className="grid grid-cols-5 gap-2 pr-4">
              {capturedSamples.map((sample, index) => (
                <div key={index} className="relative group aspect-square bg-muted rounded-md flex items-center justify-center">
                   <span className="text-xs text-muted-foreground">{index + 1}</span>
                   <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteSample(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
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
  )
}

function SentenceTrainer({ gestures, onIsCapturingChange }) {
    const [sentence, setSentence] = useState('');
    return (
        <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
                <Textarea
                    placeholder="Enter a sentence to train (e.g., How are you)"
                    value={sentence}
                    onChange={(e) => setSentence(e.target.value)}
                />
                <Button className="w-full" disabled={!sentence.trim()}>Start Sentence Training</Button>
            </div>
            <Alert variant="destructive">
              <AlertTitle>Under Construction</AlertTitle>
              <AlertDescription>
                Sentence training is not yet implemented. Please check back later.
              </AlertDescription>
            </Alert>
        </CardContent>
    )
}

export function GestureTrainer() {
  const router = useRouter();
  const { gestures, addGesture, deleteGesture, isLoading: isGesturesLoading } = useGestures();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastLandmarks, setLastLandmarks] = useState<LandmarkData>([]);
  const [activeTab, setActiveTab] = useState("word");


  const handleLandmarks = useCallback((landmarks: Landmark[], worldLandmarks: Landmark[]) => {
    setLastLandmarks(worldLandmarks);
  }, []);

  useEffect(() => {
    setIsCapturing(true);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl">Train New Gesture</CardTitle>
          <CardDescription>Capture samples of a gesture or sentence for the AI to learn.</CardDescription>
        </CardHeader>
        <CardContent>
        <WebcamView onLandmarks={handleLandmarks} isCapturing={isCapturing} className="w-full aspect-video" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="word"><Book className="mr-2"/> Word</TabsTrigger>
                <TabsTrigger value="sentence"><MessageSquare className="mr-2"/> Sentence</TabsTrigger>
            </TabsList>
            <TabsContent value="word">
                <WordTrainer 
                    gestures={gestures} 
                    addGesture={addGesture} 
                    isSaving={isSaving} 
                    setIsSaving={setIsSaving}
                    onIsCapturingChange={setIsCapturing}
                    lastLandmarks={lastLandmarks}
                    isCapturing={isCapturing}
                />
            </TabsContent>
            <TabsContent value="sentence">
                <SentenceTrainer gestures={gestures} onIsCapturingChange={setIsCapturing} />
            </TabsContent>
        </Tabs>
        </CardContent>

      </Card>
      
      <div className="space-y-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Trained Gestures</CardTitle>
            <CardDescription>A list of all gestures you have trained.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGesturesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : gestures.length > 0 ? (
              <ScrollArea className="h-[360px]">
                <div className="space-y-2 pr-4">
                  {gestures.map((gesture) => (
                    <div key={gesture.label} className="flex items-start justify-between p-3 rounded-lg bg-background hover:bg-secondary transition-colors">
                      <div>
                        <p className="font-medium">{gesture.label}</p>
                        <p className="text-sm text-muted-foreground">{gesture.description}</p>
                      </div>
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
