
export type StructureQuestion = {
  id: string;
  question: string;
  choices: [string, string, string, string];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
};

export type ReadingQuestion = {
  id: string;
  question: string;
  choices: [string, string, string, string];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
};

export type ReadingPassage = {
  id: string;
  title: string;
  paragraphs: string[];
  questions: ReadingQuestion[];
};

export type TestData = {
  id: string;
  title: string;
  structure: {
    timeLimitMinutes: number;
    questions: StructureQuestion[];
  };
  reading: {
    timeLimitMinutes: number;
    passages: ReadingPassage[];
  };
};

export type PublicStructureQuestion = Omit<StructureQuestion, "correctAnswer" | "explanation">;
export type PublicReadingQuestion = Omit<ReadingQuestion, "correctAnswer" | "explanation">;
export type PublicReadingPassage = Omit<ReadingPassage, "questions"> & { questions: PublicReadingQuestion[] };
export type PublicTestData = {
  id: string;
  title: string;
  structure: { timeLimitMinutes: number; questions: PublicStructureQuestion[] };
  reading: { timeLimitMinutes: number; passages: PublicReadingPassage[] };
};

export type ScoreRequest = {
  testId: string;
  answers: Record<string, string>;
};

export type ScoreDetail = {
  questionId: string;
  question: string;
  choices: [string,string,string,string];
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  passageTitle?: string;
};

export type ScoreResponse = {
  testId: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  structure: { correct: number; total: number; scaled: number };
  reading: { correct: number; total: number; scaled: number };
  estimatedScore: number;
  details: ScoreDetail[];
};
