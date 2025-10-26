import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Word, QuizQuestion } from '@/types/word';

export async function GET() {
  try {
    console.log('🔄 Starting quiz generation...');
    const startTime = Date.now();
    
    const db = await getDb();
    const wordsCollection = db.collection<Word>('words');

    // Optimize query - only fetch necessary fields
    const words = await wordsCollection.find(
      {}, 
      { 
        projection: { 
          _id: 1, 
          englishWord: 1, 
          translation: 1, 
          createdAt: 1,
          fromLanguage: 1,
          toLanguage: 1,
          popularity: 1
        } 
      }
    ).toArray();

    console.log(`📚 Found ${words.length} words in database`);

    if (words.length < 5) {
      return NextResponse.json(
        { error: 'Need at least 5 words to start quiz. Add more words to your vault first.' },
        { status: 400 }
      );
    }

    // Generate multiple quiz questions (5-10 questions)
    const numQuestions = Math.min(10, Math.max(5, Math.floor(words.length / 2)));
    const quizQuestions: QuizQuestion[] = [];
    
    // Shuffle all words to get random selection
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numQuestions; i++) {
      const randomWord = shuffledWords[i];
      const otherWords = shuffledWords.filter(w => w._id !== randomWord._id);
      
      // Get unique translations to avoid duplicates
      const usedTranslations = new Set([randomWord.translation]);
      const uniqueOtherWords = otherWords.filter(word => {
        if (usedTranslations.has(word.translation)) {
          return false;
        }
        usedTranslations.add(word.translation);
        return true;
      });
      
      const shuffledOthers = uniqueOtherWords.sort(() => 0.5 - Math.random()).slice(0, 3);

      // Create quiz options
      const options = [
        {
          text: randomWord.translation,
          isCorrect: true
        },
        ...shuffledOthers.map((word) => ({
          text: word.translation,
          isCorrect: false
        }))
      ];

      // Shuffle the options
      const shuffledOptions = options.sort(() => 0.5 - Math.random());

      const quizQuestion: QuizQuestion = {
        _id: randomWord._id?.toString() || '',
        englishWord: randomWord.englishWord,
        correctAnswer: randomWord.translation,
        options: shuffledOptions,
        difficulty: 'medium',
        createdAt: randomWord.createdAt || new Date(),
        fromLanguage: randomWord.fromLanguage || 'en',
        toLanguage: randomWord.toLanguage || 'hi',
        popularity: randomWord.popularity || 0
      };
      
      quizQuestions.push(quizQuestion);
    }

    const endTime = Date.now();
    console.log(`✅ Quiz generated ${quizQuestions.length} questions in ${endTime - startTime}ms`);

    return NextResponse.json({ 
      questions: quizQuestions,
      totalQuestions: quizQuestions.length,
      difficulty: 'medium'
    });
  } catch (error) {
    console.error('❌ Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wordId, isCorrect } = await request.json();

    if (!wordId) {
      return NextResponse.json(
        { error: 'Word ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const wordsCollection = db.collection<Word>('words');

    // Update review count and last reviewed date
    await wordsCollection.updateOne(
      { _id: wordId },
      {
        $inc: { reviewCount: 1 },
        $set: { lastReviewed: new Date() }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating word review:', error);
    return NextResponse.json(
      { error: 'Failed to update word review' },
      { status: 500 }
    );
  }
}
