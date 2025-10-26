export interface Word {
  _id?: string;
  englishWord: string;
  translation: string;
  fromLanguage: string;
  toLanguage: string;
  pronunciation?: string;
  partOfSpeech?: string;
  createdAt: Date;
  reviewCount: number;
  lastReviewed?: Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  userId: string;
  popularity: number; // How many users have added this word
  isPublic: boolean; // Whether this word can be used in advanced games
  isRelatedWord?: boolean; // Whether this word was added automatically (synonym/antonym)
  relatedTo?: 'synonym' | 'antonym'; // Type of related word if isRelatedWord is true
  // Enhanced fields from Dictionary API
  phonetics?: {
    text: string;
    audio?: string;
  }[];
  meanings?: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
    synonyms?: string[];
    antonyms?: string[];
  }[];
  audioUrl?: string;
  // Translation metadata
  translationSource?: string;
  alternativeTranslations?: {
    google?: string | null;
    libre?: string | null;
  };
  // Legacy field for backward compatibility
  hindiTranslation?: string;
}

export interface WordDefinition {
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
}

export interface WordExample {
  sentence: string;
  translation: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  _id?: string;
  englishWord: string;
  correctAnswer: string;
  options: QuizOption[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  fromLanguage: string;
  toLanguage: string;
  popularity: number;
}

export interface AdvancedGameWord {
  _id?: string;
  englishWord: string;
  translation: string;
  popularity: number;
  fromLanguage: string;
  toLanguage: string;
  addedBy: string; // User who added this word
  createdAt: Date;
}