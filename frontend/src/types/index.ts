export interface Timestamp {
  timestamp: number;
  summary: string;
}

export interface AnalysisResult {
  notes: string;
  quizzes: string;
  flashcards: string;
  interview_questions: string;
  timestamps: Timestamp[];
  formulas: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface FlashCard {
  question: string;
  answer: string;
}

export interface InterviewQuestion {
  level: string;
  questions: { question: string; answer: string }[];
}
