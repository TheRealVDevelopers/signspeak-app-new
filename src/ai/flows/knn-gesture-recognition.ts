'use server';

/**
 * @fileOverview Recognizes hand gestures using a K-Nearest Neighbors (KNN) algorithm.
 *
 * - knnGestureRecognition - A function that takes hand landmarks and identifies the corresponding gesture.
 * - KNNGestureRecognitionInput - The input type for the knnGestureRecognition function.
 * - KNNGestureRecognitionOutput - The return type for the knnGestureRecognition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KNNGestureRecognitionInputSchema = z.object({
  landmarks: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
  ).describe('An array of 3D coordinates representing hand landmarks.'),
  trainedGestures: z.array(
    z.object({
      label: z.string(),
      samples: z.array(
        z.array(
          z.object({
            x: z.number(),
            y: z.number(),
            z: z.number(),
          })
        )
      ),
    })
  ).describe('An array of trained gestures, each with a label and sample landmarks.'),
});

export type KNNGestureRecognitionInput = z.infer<typeof KNNGestureRecognitionInputSchema>;

const KNNGestureRecognitionOutputSchema = z.object({
  recognizedGesture: z.string().describe('The label of the recognized gesture.'),
  confidence: z.number().describe('The confidence score of the recognition (0-1).'),
});

export type KNNGestureRecognitionOutput = z.infer<typeof KNNGestureRecognitionOutputSchema>;

// Simple KNN implementation (can be replaced with a more sophisticated library)
function kNearestNeighbors(
  inputLandmarks: {x: number; y: number; z: number}[],
  trainedGestures: {label: string; samples: {x: number; y: number; z: number}[][]}[],
  k: number = 3 // Number of neighbors to consider
): {label: string; confidence: number} {
  if (!trainedGestures || trainedGestures.length === 0) {
    return {label: 'No gestures trained', confidence: 0};
  }

  const distances: {label: string; distance: number}[] = [];

  for (const gesture of trainedGestures) {
    for (const sample of gesture.samples) {
      let totalDistance = 0;
      for (let i = 0; i < Math.min(inputLandmarks.length, sample.length); i++) {
        const dx = inputLandmarks[i].x - sample[i].x;
        const dy = inputLandmarks[i].y - sample[i].y;
        const dz = inputLandmarks[i].z - sample[i].z;
        totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      distances.push({label: gesture.label, distance: totalDistance});
    }
  }

  distances.sort((a, b) => a.distance - b.distance);

  const nearestNeighbors = distances.slice(0, k);

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

  const confidence = distances.length > 0 ? maxCount / k : 0;

  return {label: predictedLabel, confidence: confidence};
}

export async function knnGestureRecognition(input: KNNGestureRecognitionInput): Promise<KNNGestureRecognitionOutput> {
  return knnGestureRecognitionFlow(input);
}

const knnGestureRecognitionFlow = ai.defineFlow(
  {
    name: 'knnGestureRecognitionFlow',
    inputSchema: KNNGestureRecognitionInputSchema,
    outputSchema: KNNGestureRecognitionOutputSchema,
  },
  async input => {
    const {landmarks, trainedGestures} = input;

    const {label, confidence} = kNearestNeighbors(
      landmarks,
      trainedGestures,
    );

    return {recognizedGesture: label, confidence: confidence};
  }
);
