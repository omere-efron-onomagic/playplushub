import { z } from 'zod';

export const quizmoQuestionSchema = z.object({
  levelIndex: z.number().int().min(1, 'Level index must be at least 1'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  question: z.string().min(1, 'Question text is required'),
  options: z.tuple([
    z.string().min(1, 'Option 1 is required'),
    z.string().min(1, 'Option 2 is required'),
    z.string().min(1, 'Option 3 is required'),
    z.string().min(1, 'Option 4 is required'),
  ]),
  correctAnswerIndex: z.number().int().min(0).max(3, 'Correct answer must be between 0 and 3'),
});

export const quizmoStageSchema = z.object({
  stageId: z.string().min(1, 'Stage ID is required'),
  title: z.string().min(1, 'Title is required'),
  questions: z.array(quizmoQuestionSchema).min(1, 'At least one question is required'),
});

export type QuizmoQuestionForm = z.infer<typeof quizmoQuestionSchema>;
export type QuizmoStageForm = z.infer<typeof quizmoStageSchema>;
