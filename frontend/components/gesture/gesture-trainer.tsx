
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGestures } from '@/frontend/hooks/use-gestures';
import type { Landmark, LandmarkData, Gesture, Sentence, SentenceGesture } from '@/frontend/lib/types';
import { useToast } from '@/frontend/hooks/use-toast';
import { WebcamView } from '@/frontend/components/webcam/webcam-view';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Progress } from '@/frontend/components/ui/progress';
import { ScrollArea } from '@/frontend/components/ui/scroll-area';
import { Camera, Trash2, Loader2, CheckCircle, ArrowRight, X, Book, MessageSquare, BookOpen, Play, Square, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/frontend/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/frontend/components/ui/skeleton';
import { Textarea } from '@/frontend/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs';
import { useSentences } from '@/frontend/hooks/use-sentences';
import { sentenceDB } from '@/frontend/lib/db';

const WORD_SAMPLES_REQUIRED = 30;

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
    if (capturedSamples.length < WORD_SAMPLES_REQUIRED) {
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
    if (capturedSamples.length < WORD_SAMPLES_REQUIRED) {
      toast({ variant: 'destructive', title: 'Error', description: `Please capture ${WORD_SAMPLES_REQUIRED} samples.` });
      return;
    }
    if (gestures.some(g => g.label.toLowerCase() === gestureName.trim().toLowerCase())) {
        toast({
            variant: 'destructive',
            title: 'Validation Failed',
            description: `This gesture name already exists. Please choose a different name.`,
        });
        return;
    }

    setIsSaving(true);

    const normalizedSamples = capturedSamples.map(sample => normalizeLandmarks(sample));
    const newGesture: Gesture = { label: gestureName, description: gestureDescription, samples: normalizedSamples, type: 'word' };
    
    try {
        await addGesture(newGesture);
        toast({
            title: 'Gesture Saved!',
            description: `${gestureName} has been trained successfully.`,
        });
        setGestureName('');
        setGestureDescription('');
        setCapturedSamples([]);

    } catch (error) {
        console.error("Save error:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during saving.' });
    } finally {
        setIsSaving(false);
    }
  };

  useEffect(() => {
    onIsCapturingChange(true);
  }, [onIsCapturingChange]);

  const progress = (capturedSamples.length / WORD_SAMPLES_REQUIRED) * 100;

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
          <Button onClick={handleCapture} disabled={!isCapturing || capturedSamples.length >= WORD_SAMPLES_REQUIRED || isSaving || !gestureName} className="flex-1">
            <Camera className="mr-2" /> Capture Sample
          </Button>
          <Progress value={progress} className="w-1/2" />
          <span className="text-sm text-muted-foreground">{capturedSamples.length}/{WORD_SAMPLES_REQUIRED}</span>
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
      
      {capturedSamples.length >= WORD_SAMPLES_REQUIRED && (
        <Alert className="border-primary bg-primary/10">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertTitle>Ready to Save!</AlertTitle>
          <AlertDescription>
            You have captured enough samples. Click "Save Gesture" to train the model.
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={handleSaveGesture} disabled={capturedSamples.length < WORD_SAMPLES_REQUIRED || isSaving || !isCapturing || !gestureName} className="w-full" size="lg">
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Gesture
      </Button>
    </CardContent>
  )
}

function SentenceGestureCapturer({ gestureName, onCaptureComplete, lastLandmarks, isCapturing, gestures, sentences }) {
    const [capturedSamples, setCapturedSamples] = useState<LandmarkData[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleCapture = () => {
        if (lastLandmarks.length === 0) {
            toast({ variant: 'destructive', title: 'Capture Failed', description: 'No hand detected. Please make sure your hand is visible.' });
            return;
        }
        if (capturedSamples.length < WORD_SAMPLES_REQUIRED) {
            setCapturedSamples(prev => [...prev, lastLandmarks]);
        }
    };

    const handleSave = async () => {
        if (capturedSamples.length < WORD_SAMPLES_REQUIRED) {
            toast({ variant: 'destructive', title: 'Error', description: `Please capture ${WORD_SAMPLES_REQUIRED} samples.` });
            return;
        }
        
        const existingGesture = gestures.find(g => g.label.toLowerCase() === gestureName.toLowerCase());
        const allSentenceGestures = sentences.filter(s => s.gestures).flatMap(s => s.gestures).filter(Boolean);
        const existingInSentence = allSentenceGestures.find(g => g.label.toLowerCase() === gestureName.toLowerCase());

        if (existingGesture || existingInSentence) {
            const confirmed = window.confirm(`The gesture "${gestureName}" already exists. Do you want to use the existing gesture for this sentence?`);
            if (confirmed) {
                const samples = existingGesture ? existingGesture.samples : existingInSentence!.samples;
                onCaptureComplete({
                    label: gestureName,
                    samples: samples,
                });
                return;
            }
        }
        
        setIsSaving(true);
        const normalizedSamples = capturedSamples.map(sample => normalizeLandmarks(sample));
        const gestureData: SentenceGesture = {
            label: gestureName,
            samples: normalizedSamples,
        };
        onCaptureComplete(gestureData);
        setIsSaving(false);
        toast({ title: 'Gesture Captured!', description: `Gesture for "${gestureName}" is ready for sentence.` });
    };

    const progress = (capturedSamples.length / WORD_SAMPLES_REQUIRED) * 100;
    
    return (
        <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
            <h3 className="font-semibold text-center text-lg">Show gesture for: <span className="text-primary">{gestureName}</span></h3>
            <div className="flex items-center gap-4">
                <Button onClick={handleCapture} disabled={!isCapturing || capturedSamples.length >= WORD_SAMPLES_REQUIRED || isSaving} className="flex-1">
                    <Camera className="mr-2" /> Capture Sample
                </Button>
                <Progress value={progress} className="w-1/2" />
                <span className="text-sm text-muted-foreground">{capturedSamples.length}/{WORD_SAMPLES_REQUIRED}</span>
            </div>
            {capturedSamples.length >= WORD_SAMPLES_REQUIRED && (
                 <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2"/>}
                    Confirm Gesture for "{gestureName}"
                </Button>
            )}
        </div>
    );
}

function SentenceTrainer({ onIsCapturingChange, lastLandmarks, addSentence, gestures, sentences }) {
  const { toast } = useToast();
  const [sentenceLabel, setSentenceLabel] = useState('');
  const [sentenceWords, setSentenceWords] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedGestures, setCapturedGestures] = useState<SentenceGesture[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sentenceWords.length > 0 && capturedGestures.length === sentenceWords.length) {
      const handleSaveSentence = async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        try {
          const newSentence: Sentence = {
            label: sentenceLabel.trim(),
            gestures: capturedGestures,
          };
          
          await addSentence(newSentence);
          
          toast({
            title: 'Sentence Saved!',
            description: `"${newSentence.label}" has been trained successfully.`,
          });
          
          resetTraining();
    
        } catch (error) {
          console.error("Error saving sentence:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not save the sentence.' });
        } finally {
            setIsSaving(false);
        }
      };
      handleSaveSentence();
    }
  }, [capturedGestures, sentenceWords, sentenceLabel, addSentence, toast, isSaving]);


  const startTraining = () => {
      const words = sentenceLabel.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please enter a sentence.' });
          return;
      }
      if (sentences.some(s => s.label.toLowerCase() === sentenceLabel.trim().toLowerCase())) {
        toast({ variant: 'destructive', title: 'Error', description: 'This sentence has already been trained.' });
        return;
      }
      setSentenceWords(words);
      setCurrentStep(0);
      setCapturedGestures([]);
      setIsSaving(false);
  };
  
  const resetTraining = () => {
    setSentenceLabel('');
    setSentenceWords([]);
    setCurrentStep(0);
    setCapturedGestures([]);
    setIsSaving(false);
  };

  const handleGestureCaptured = (gesture: SentenceGesture) => {
      setCapturedGestures(prev => [...prev, gesture]);
      setCurrentStep(prev => prev + 1);
  };

  useEffect(() => {
    onIsCapturingChange(true);
  }, [onIsCapturingChange]);

  const isTrainingStarted = sentenceWords.length > 0;
  const isTrainingInProgress = isTrainingStarted && currentStep < sentenceWords.length;

  return (
    <CardContent className="space-y-4 pt-6">
      {!isTrainingStarted ? (
        <div className="space-y-4">
            <Input
                id="sentence-label"
                placeholder="e.g., How are you?"
                value={sentenceLabel}
                onChange={(e) => setSentenceLabel(e.target.value)}
                disabled={isSaving}
            />
            <Button onClick={startTraining} disabled={!sentenceLabel.trim() || isSaving} className="w-full">
                Start Sentence Training
            </Button>
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How it works</AlertTitle>
                <AlertDescription>
                   Enter a sentence. Then, you'll be asked to capture the gesture for each word one by one.
                </AlertDescription>
            </Alert>
        </div>
      ) : (
        <div className="space-y-4">
            <div className="text-center p-2 rounded-lg bg-background">
                <p className="text-muted-foreground">Training Sentence:</p>
                <h2 className="text-2xl font-bold text-primary">{sentenceLabel}</h2>
                <p className="text-sm text-muted-foreground">
                  {isTrainingInProgress ? `Step ${currentStep + 1} of ${sentenceWords.length}` : (isSaving ? 'Saving...' : 'Finished!')}
                </p>
            </div>
            
            {isTrainingInProgress ? (
                <SentenceGestureCapturer 
                    key={currentStep}
                    gestureName={sentenceWords[currentStep]}
                    onCaptureComplete={handleGestureCaptured}
                    lastLandmarks={lastLandmarks}
                    isCapturing={true}
                    gestures={gestures}
                    sentences={sentences}
                />
            ) : (
                 <div className="space-y-4">
                    <Alert className="border-primary bg-primary/10">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <AlertTitle>All gestures captured!</AlertTitle>
                        <AlertDescription>
                           Sentence is being saved. Please wait.
                        </AlertDescription>
                    </Alert>
                    {isSaving && <div className="flex justify-center items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</div>}
                </div>
            )}
             <Button variant="outline" onClick={resetTraining} disabled={isSaving}>
                Cancel
            </Button>
        </div>
      )}
    </CardContent>
  );
}


export function GestureTrainer() {
  const router = useRouter();
  const { gestures, addGesture, deleteGesture, isLoading: isGesturesLoading } = useGestures();
  const { sentences, addSentence, deleteSentence, isLoading: isSentencesLoading } = useSentences();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastLandmarks, setLastLandmarks] = useState<LandmarkData>([]);
  const [activeTab, setActiveTab] = useState("word");

  const handleLandmarks = useCallback((landmarks: Landmark[], worldLandmarks: Landmark[]) => {
    if (worldLandmarks && worldLandmarks.length > 0) {
        setLastLandmarks(worldLandmarks);
    } else {
        setLastLandmarks([]);
    }
  }, []);

  useEffect(() => {
    setIsCapturing(true);
  }, []);

  const wordCount = gestures.length;
  const sentenceCount = sentences.length;

  return (
    <div className="grid lg:grid-cols-2 gap-8 p-4 md:p-6">
      <div className="lg:col-span-1 space-y-4">
        <WebcamView onLandmarks={handleLandmarks} isCapturing={isCapturing} className="w-full aspect-video" />
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Train New Gesture</CardTitle>
            <CardDescription>Capture samples of a word or a sentence for the AI to learn.</CardDescription>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <SentenceTrainer 
                    onIsCapturingChange={setIsCapturing} 
                    lastLandmarks={lastLandmarks} 
                    addSentence={addSentence} 
                    gestures={gestures}
                    sentences={sentences}
                  />
              </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <div className="lg:col-span-1 space-y-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Trained Library</CardTitle>
            <CardDescription>{`You have trained ${wordCount} words and ${sentenceCount} sentences.`}</CardDescription>
          </CardHeader>
          <CardContent>
             {isGesturesLoading || isSentencesLoading ? (
               <div className="space-y-2">
                 {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
               </div>
             ) : (
                <ScrollArea className="h-[360px]">
                  <div className="space-y-4 pr-4">
                      {gestures.length > 0 && (
                          <div>
                              <h3 className="text-lg font-semibold mb-2">Words</h3>
                              <div className="space-y-2">
                              {gestures.map((gesture) => (
                                  <div key={gesture.label} className="flex items-start justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
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
                          </div>
                      )}
                      {sentences.length > 0 && (
                          <div>
                              <h3 className="text-lg font-semibold mb-2">Sentences</h3>
                              <div className="space-y-2">
                              {sentences.map((sentence) => (
                                  <div key={sentence.label} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors">
                                  <div className="flex-1">
                                    <p className="font-medium">{sentence.label}</p>
                                    {sentence.gestures && (
                                        <p className="text-sm text-muted-foreground">
                                            {sentence.gestures.map(g => g.label).join(' → ')}
                                        </p>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => deleteSentence(sentence.label)} aria-label={`Delete ${sentence.label}`}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                  </div>
                              ))}
                              </div>
                          </div>
                      )}
                      {wordCount === 0 && sentenceCount === 0 && (
                          <p className="text-muted-foreground text-center py-8">No words or sentences trained yet.</p>
                      )}
                  </div>
                </ScrollArea>
             )}
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={() => router.push('/detect')} disabled={wordCount === 0 && sentenceCount === 0}>
              Go to Detection Page <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

    