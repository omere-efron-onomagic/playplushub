import { z } from 'zod';

/**
 * Validation schema for Cinemoji puzzle creation/editing.
 */

export const cinemojiPuzzleSchema = z.object({
  index: z.number().int().positive('Index must be a positive integer'),
  category: z.string().min(1, 'Category is required'),
  leftEmoji: z.string().min(1, 'Left emoji is required'),
  rightEmoji: z.string().min(1, 'Right emoji is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
});

export const cinemojiHintSchema = z.object({
  mode: z.enum(['mode1', 'mode2']),
  stage: z.number().int().positive('Stage must be a positive integer'),
  hintText: z.string().min(1, 'Hint text is required').max(500, 'Hint must be 500 characters or less'),
});

export type CinemojiPuzzleForm = z.infer<typeof cinemojiPuzzleSchema>;
export type CinemojiHintForm = z.infer<typeof cinemojiHintSchema>;
