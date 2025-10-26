import { Word } from '@/types/word';

// Fallback storage using localStorage when MongoDB is not available
export const getStoredWords = (): Word[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('wordLearner_words');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

export const saveWord = (word: Omit<Word, '_id'>): Word => {
  const words = getStoredWords();
  const newWord: Word = {
    ...word,
    _id: Date.now().toString(), // Simple ID generation
  };
  
  words.unshift(newWord); // Add to beginning
  
  try {
    localStorage.setItem('wordLearner_words', JSON.stringify(words));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  
  return newWord;
};

export const updateWordReview = (wordId: string, isCorrect: boolean): void => {
  const words = getStoredWords();
  const wordIndex = words.findIndex(w => w._id === wordId);
  
  if (wordIndex !== -1) {
    words[wordIndex].reviewCount += 1;
    words[wordIndex].lastReviewed = new Date();
    
    try {
      localStorage.setItem('wordLearner_words', JSON.stringify(words));
    } catch (error) {
      console.error('Error updating word in localStorage:', error);
    }
  }
};
