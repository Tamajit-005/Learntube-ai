export interface Timestamp {
  timestamp: number;
  summary: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface InterviewQuestion {
  question: string;
  description: string;
}

export interface InterviewSection {
  level: string;
  intro: string;
  questions: InterviewQuestion[];
}

export interface AnalysisResult {
  notes: string;
  quizzes: string | { questions: QuizQuestion[] };
  flashcards: string;
  interview_questions: string | { sections: InterviewSection[] };
  timestamps: Timestamp[];
  formulas: string;
}

export interface AnalyzeResponse {
  result: AnalysisResult;
}

export interface SessionRecord {
  url: string;
  analyzed_at: string;
  result: AnalysisResult;
}

