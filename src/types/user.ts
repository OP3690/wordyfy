export interface User {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  fromLanguage: string;
  toLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  xp: number;
  level: number;
  streak: number;
  lastActive: Date;
  achievements: string[];
}

export interface UserStats {
  totalWords: number;
  wordsLearned: number;
  quizAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
}
