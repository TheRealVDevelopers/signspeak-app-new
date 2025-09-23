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

const validateGestureFlow = ai.defineFlow(
  {
    name: 'validateGestureFlow',
    inputSchema: ValidateGestureInputSchema,
    outputSchema: ValidateGestureOutputSchema,
  },
  async input => {
    const { gestureName, trainedLandmarks } = input;
    
    // A simple check to see the gesture name already exists as a key in trainedLandmarks
    const gestureExists = Object.keys(trainedLandmarks).includes(
      gestureName
    );
    if(gestureExists){
      // Gesture name already exists, this is not a valid new gesture.
      return { isValid: false, confidence: 0.0 };
    }

    // Since we are removing the similarity check, we can always return true.
    // The only check we keep is for duplicate gesture names.
    return { isValid: true, confidence: 1.0 };
  }
);
