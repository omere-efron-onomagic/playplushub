import { z } from 'zod';

/**
 * Validation schema for Link Four round creation.
 */

export const linkFourLevelSchema = z.object({
  answer: z
    .string()
    .min(1, 'Answer is required')
    .max(20, 'Answer must be 20 characters or less')
    .regex(/^[A-Z\s]+$/i, 'Answer must contain only letters and spaces'),
  images: z.tuple([
    z.string().url('Image 1 must be a valid URL').min(1, 'Image 1 is required'),
    z.string().url('Image 2 must be a valid URL').min(1, 'Image 2 is required'),
    z.string().url('Image 3 must be a valid URL').min(1, 'Image 3 is required'),
    z.string().url('Image 4 must be a valid URL').min(1, 'Image 4 is required'),
  ]),
});

export const linkFourRoundSchema = z.object({
  roundId: z
    .string()
    .min(1, 'Round ID is required')
    .regex(/^[a-z0-9-]+$/i, 'Round ID must contain only letters, numbers, and hyphens'),
  levels: z
    .array(linkFourLevelSchema)
    .min(1, 'At least one level is required')
    .max(20, 'Maximum 20 levels per round'),
});

export type LinkFourLevelForm = z.infer<typeof linkFourLevelSchema>;
export type LinkFourRoundForm = z.infer<typeof linkFourRoundSchema>;
