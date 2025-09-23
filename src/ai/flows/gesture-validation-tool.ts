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

    // Flatten the new gesture samples for comparison, as we only need one to check against all trained samples
    const sampleToCompare = newGestureSamples[0];
    
    for (const label in trainedGestures) {
        for (const trainedSample of trainedGestures[label]) {
            const distance = euclideanDistance(sampleToCompare, trainedSample);
            distances.push({ label, distance });
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
    
    // A simple check to see the gesture name already exists as a key in trainedLandmarks
    const gestureExists = Object.keys(trainedLandmarks).includes(
      gestureName
    );
    if(gestureExists){
      // Gesture name already exists, this is not a valid new gesture.
      return { isValid: false, confidence: 0.0 };
    }

    // Check if there's anything to compare against
    if (Object.keys(trainedLandmarks).length === 0) {
        // This is the first gesture being trained, so it's always valid.
        return { isValid: true, confidence: 1.0 };
    }

    const { predictedLabel, confidence } = knn(landmarkData, trainedLandmarks, 5);

    // The new gesture is considered invalid if it too closely matches an *existing different* gesture.
    // A high confidence match for a *different* gesture name means it's likely a duplicate or too similar.
    const isTooSimilarToAnotherGesture = predictedLabel !== gestureName && confidence > 0.6;

    if (isTooSimilarToAnotherGesture) {
      // It's too similar to another gesture, so it's not a valid new gesture.
      // We return the confidence of the mismatch.
      return { isValid: false, confidence: confidence };
    }

    // If it's not a duplicate name and not too similar to other gestures, we can accept it.
    // The confidence here can represent its uniqueness. Let's return a high confidence.
    return { isValid: true, confidence: 1.0 - confidence };
  }
);
