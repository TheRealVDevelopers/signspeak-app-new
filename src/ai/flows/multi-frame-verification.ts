'use server';

/**
 * @fileOverview Implements multi-frame verification for gesture detection.
 *
 * - verifyMultiFrameConsistency - Verifies that a gesture is consistently detected across multiple frames.
 * - MultiFrameVerificationInput - The input type for the verifyMultiFrameConsistency function.
 * - MultiFrameVerificationOutput - The return type for the verifyMultiFrameConsistency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultiFrameVerificationInputSchema = z.object({
  detectedGestures: z
    .array(z.string())
    .describe('An array of detected gestures from recent frames.'),
  requiredConsistency: z
    .number()
    .int()
    .min(1)
    .describe(
      'The number of consecutive frames the gesture must be detected in to be considered valid.'
    ),
});
export type MultiFrameVerificationInput = z.infer<
  typeof MultiFrameVerificationInputSchema
>;

const MultiFrameVerificationOutputSchema = z.object({
  isValidGesture: z
    .boolean()
    .describe(
      'Whether the gesture has been consistently detected across the required number of frames.'
    ),
  consistentGesture: z
    .string()
    .optional()
    .describe(
      'The gesture that was consistently detected, if any.  Undefined if no gesture was consistently detected.'
    ),
});
export type MultiFrameVerificationOutput = z.infer<
  typeof MultiFrameVerificationOutputSchema
>;

export async function verifyMultiFrameConsistency(
  input: MultiFrameVerificationInput
): Promise<MultiFrameVerificationOutput> {
  return multiFrameVerificationFlow(input);
}

const multiFrameVerificationFlow = ai.defineFlow(
  {
    name: 'multiFrameVerificationFlow',
    inputSchema: MultiFrameVerificationInputSchema,
    outputSchema: MultiFrameVerificationOutputSchema,
  },
  async input => {
    const {detectedGestures, requiredConsistency} = input;

    if (detectedGestures.length < requiredConsistency) {
      return {
        isValidGesture: false,
        consistentGesture: undefined,
      };
    }

    let consistentGesture: string | undefined = undefined;
    let isValidGesture = false;

    // Check for consistent gestures across the required number of frames
    for (let i = 0; i <= detectedGestures.length - requiredConsistency; i++) {
      const subArray = detectedGestures.slice(i, i + requiredConsistency);
      const allEqual = subArray.every(val => val === subArray[0]);

      if (allEqual) {
        consistentGesture = subArray[0];
        isValidGesture = true;
        break;
      }
    }

    return {
      isValidGesture: isValidGesture,
      consistentGesture: consistentGesture,
    };
  }
);
