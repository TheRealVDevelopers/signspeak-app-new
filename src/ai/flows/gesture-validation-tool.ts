'use server';

/**
 * @fileOverview Validates a newly trained gesture by comparing it against
 * its training data using KNN.
 *
 * - validateGesture - A function that validates a gesture after training.
 * - ValidateGestureInput - The input type for the validateGesture function.
 * - ValidateGestureOutput - The return type for the validateGesture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateGestureInputSchema = z.object({
  gestureName: z.string().describe('The name of the gesture to validate.'),
  landmarkData: z
    .array(z.array(z.number()))
    .describe(
      'Array of landmark data (x, y, z coordinates) for the gesture to validate.'
    ),
  trainedLandmarks: z
    .record(z.array(z.array(z.number())))
    .describe('The training data consisting of gesture name and landmark data.'),
});
export type ValidateGestureInput = z.infer<typeof ValidateGestureInputSchema>;

const ValidateGestureOutputSchema = z.object({
  isValid: z
    .boolean()
    .describe(
      'Whether the gesture is recognized correctly based on KNN comparison.'
    ),
  confidence: z.number().describe('The confidence score of the validation.'),
});
export type ValidateGestureOutput = z.infer<typeof ValidateGestureOutputSchema>;

export async function validateGesture(
  input: ValidateGestureInput
): Promise<ValidateGestureOutput> {
  return validateGestureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateGesturePrompt',
  input: {
    schema: ValidateGestureInputSchema,
  },
  output: {schema: ValidateGestureOutputSchema},
  prompt: `You are an AI validation tool that determines if a given gesture
  matches its training data using a K-Nearest Neighbors (KNN) approach.

  Input gesture name: {{{gestureName}}}
  Input landmark data: {{{landmarkData}}}
  Trained landmark data: {{{trainedLandmarks}}}

  Determine if the input landmark data closely resembles any of the
  trained landmark samples for the given gesture name.

  Return whether the gesture is valid and provide a confidence score.
  `,
});

// Helper function to calculate Euclidean distance between two landmark sets
function euclideanDistance(landmarks1: number[], landmarks2: number[]): number {
    let sum = 0;
    for (let i = 0; i < Math.min(landmarks1.length, landmarks2.length); i++) {
        sum += (landmarks1[i] - landmarks2[i]) ** 2;
    }
    return Math.sqrt(sum);
}

// K-Nearest Neighbors implementation
function knn(newGestureSamples: number[][], trainedGestures: Record<string, number[][]>, k: number = 3): { predictedLabel: string, confidence: number } {
    const distances: { label: string, distance: number }[] = [];

    // Calculate distances from each sample of the new gesture to all samples of trained gestures
    for (const sample of newGestureSamples) {
        for (const label in trainedGestures) {
            for (const trainedSample of trainedGestures[label]) {
                const distance = euclideanDistance(sample, trainedSample);
                distances.push({ label, distance });
            }
        }
    }
    
    // Sort distances and get the k-nearest neighbors
    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, k);

    // Vote for the most frequent label among neighbors
    const votes: Record<string, number> = {};
    for (const neighbor of neighbors) {
        votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    }

    let predictedLabel = '';
    let maxVotes = 0;
    for (const label in votes) {
        if (votes[label] > maxVotes) {
            maxVotes = votes[label];
            predictedLabel = label;
        }
    }

    const confidence = k > 0 ? maxVotes / k : 0;
    return { predictedLabel, confidence };
}


const validateGestureFlow = ai.defineFlow(
  {
    name: 'validateGestureFlow',
    inputSchema: ValidateGestureInputSchema,
    outputSchema: ValidateGestureOutputSchema,
  },
  async input => {
    const { gestureName, landmarkData, trainedLandmarks } = input;
    
    // Check if there's anything to compare against
    if (Object.keys(trainedLandmarks).length === 0) {
        // First gesture, always valid.
        return { isValid: true, confidence: 1.0 };
    }

    const { predictedLabel, confidence } = knn(landmarkData, trainedLandmarks, 5);

    // The new gesture is considered valid if it doesn't closely match an *existing different* gesture.
    // A high confidence match for a *different* gesture name means it's likely a duplicate or too similar.
    const isSimilarToOtherGesture = predictedLabel !== '' && predictedLabel !== gestureName && confidence > 0.5;

    if (isSimilarToOtherGesture) {
      return { isValid: false, confidence: 1 - confidence };
    }

    // A simple check to see the gesture name exists as a key in trainedLandmarks
    const gestureExists = Object.keys(trainedLandmarks).includes(
      gestureName
    );
    if(gestureExists){
      return { isValid: false, confidence: 0.3 }; // Gesture name already exists
    }

    // If it's not too similar to others, and the name is new, we can accept it.
    // Confidence here could represent clarity or uniqueness. For now, let's use a proxy.
    const averageDistance = 1;
    const validationConfidence = Math.max(0.75, Math.min(1, 1 / (1 + averageDistance)));


    return { isValid: true, confidence: validationConfidence };
  }
);
