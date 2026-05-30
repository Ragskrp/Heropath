
export type CurriculumLevel = "KS3" | "KS4";

export interface Question {
  id: string;
  type: "multiple-choice" | "boolean" | "text";
  questionText: string;
  options?: string[]; // required if multiple-choice
  correctAnswer: string;
  explanation: string;
  marks: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  order: number;
  questions: Question[];
  isBossBattle?: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  quests: Quest[];
}

export interface Subject {
  id: string;
  title: string;
  level: CurriculumLevel;
  topics: Topic[];
}
