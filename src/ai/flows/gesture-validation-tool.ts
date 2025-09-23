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

const validateGestureFlow = ai.defineFlow(
  {
    name: 'validateGestureFlow',
    inputSchema: ValidateGestureInputSchema,
    outputSchema: ValidateGestureOutputSchema,
  },
  async input => {
    // Implement KNN comparison logic here.
    // Placeholder implementation - replace with actual KNN logic

    // Simple check to see the gesture name exists as a key in trainedLandmarks
    const isValid = Object.keys(input.trainedLandmarks).includes(
      input.gestureName
    );
    const confidence = isValid ? 0.9 : 0.2; // Arbitrary confidence values.

    return {isValid, confidence};
  }
);
