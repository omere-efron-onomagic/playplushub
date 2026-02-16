export type QuizmoStageSummary = {
  stageId: string;
  title: string;
  totalQuestions: number;
};

export type QuizmoQuestion = {
  levelIndex: number;
  imageUrl: string;
  question: string;
  options: [string, string, string, string];
};

export type QuizmoQuestionInternal = QuizmoQuestion & {
  correctAnswerIndex: number;
};

export type QuizmoAnswerPayload = {
  levelIndex: number;
  answerIndex: number | null;
};

export type QuizmoCompleteBody = {
  sessionToken: string;
  stageId: string;
  answers: QuizmoAnswerPayload[];
};
