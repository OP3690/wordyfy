import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { AdvancedGameWord, QuizQuestion } from '@/types/word';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const fromLanguage = searchParams.get('fromLanguage');
    const toLanguage = searchParams.get('toLanguage');
    const userId = searchParams.get('userId');
    
    if (!fromLanguage || !toLanguage) {
      return NextResponse.json({ error: 'Language preferences are required' }, { status: 400 });
    }

    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        isAdmin = user?.email === 'omprakashutaha@gmail.com';
      } catch (error) {
        console.error('Error checking admin status:', error);
        isAdmin = false;
      }
    }

    // Check user's word count to determine access and question limit
    let userWordCount = 0;
    if (userId) {
      const userWords = await db.collection('words').find({
        userId,
        fromLanguage,
        toLanguage
      }).toArray();
      userWordCount = userWords.length;
    }

    // Determine access and question limit based on word count
    let hasAccess = false;
    let questionLimit = 0;
    let accessLevel = '';

    // Admin bypass: Admin gets full access regardless of word count
    if (isAdmin) {
      hasAccess = true;
      questionLimit = 50; // Admin gets maximum questions
      accessLevel = 'Admin (50 questions)';
    } else if (userWordCount >= 50) {
      hasAccess = true;
      if (userWordCount >= 50 && userWordCount <= 75) {
        questionLimit = 5;
        accessLevel = 'Basic (5 questions)';
      } else if (userWordCount >= 76 && userWordCount <= 125) {
        questionLimit = 10;
        accessLevel = 'Intermediate (10 questions)';
      } else if (userWordCount >= 126 && userWordCount <= 200) {
        questionLimit = 25;
        accessLevel = 'Advanced (25 questions)';
      } else if (userWordCount > 200) {
        questionLimit = 50;
        accessLevel = 'Expert (50 questions)';
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ 
        error: `Advanced Quiz requires at least 50 words in your vault. You currently have ${userWordCount} words.`,
        userWordCount,
        requiredWords: 50
      }, { status: 403 });
    }

    // Get all words from community_words collection (pre-imported words)
    const words = await db.collection('community_words').find({
      fromLanguage,
      toLanguage
    }).toArray();

    if (words.length < 4) {
      return NextResponse.json({ 
        error: 'Not enough words available for advanced game. Need at least 4 words from users with same language preferences.',
        availableWords: words.length
      }, { status: 400 });
    }

    // Get user's own words to exclude from options
    const userWords = userId ? await db.collection('words').find({
      userId,
      fromLanguage,
      toLanguage
    }).toArray() : [];

    const userWordSet = new Set(userWords.map(w => w.englishWord));

    // Filter out user's own words and get popular words
    const availableWords = words
      .filter(w => !userWordSet.has(w.word))
      .sort((a, b) => b.addedByCount - a.addedByCount);

    if (availableWords.length < 4) {
      return NextResponse.json({ 
        error: 'Not enough unique words available for advanced game',
        availableWords: availableWords.length
      }, { status: 400 });
    }

    // Create quiz questions with unique words
    const questions: QuizQuestion[] = [];
    const usedWords = new Set();
    const actualQuestionLimit = Math.min(questionLimit, availableWords.length);

    for (let i = 0; i < actualQuestionLimit; i++) {
      let selectedWord;
      do {
        selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      } while (usedWords.has(selectedWord.word) && usedWords.size < availableWords.length);
      
      usedWords.add(selectedWord.word);

      // Get 3 random incorrect options from other words
      const incorrectOptions = availableWords
        .filter(w => w.word !== selectedWord.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => ({
          text: w.translation,
          isCorrect: false
        }));

      // Create options with correct answer
      const options = [
        { text: selectedWord.translation, isCorrect: true },
        ...incorrectOptions
      ].sort(() => Math.random() - 0.5);

      questions.push({
        _id: selectedWord._id.toString(),
        englishWord: selectedWord.word,
        correctAnswer: selectedWord.translation,
        options,
        difficulty: 'medium',
        createdAt: selectedWord.createdAt,
        fromLanguage: selectedWord.fromLanguage,
        toLanguage: selectedWord.toLanguage,
        popularity: selectedWord.addedByCount
      });
    }

    return NextResponse.json({ 
      questions,
      totalAvailable: availableWords.length,
      languagePair: `${fromLanguage} → ${toLanguage}`,
      userWordCount,
      accessLevel,
      questionLimit: actualQuestionLimit
    });
  } catch (error) {
    console.error('Error creating advanced game:', error);
    return NextResponse.json({ error: 'Failed to create advanced game' }, { status: 500 });
  }
}
