import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Word, QuizQuestion } from '@/types/word';

export async function GET() {
  try {
    const db = await getDb();
    const wordsCollection = db.collection<Word>('words');

    const words = await wordsCollection.find({}).toArray();

    if (words.length < 5) {
      return NextResponse.json(
        { error: 'Need at least 5 words to start quiz' },
        { status: 400 }
      );
    }

    // Get a random word
    const randomWord = words[Math.floor(Math.random() * words.length)];

    // Get 3 other random words for wrong options
    const otherWords = words.filter(w => w._id !== randomWord._id);
    const shuffledOthers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);

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

    return NextResponse.json({ questions: [quizQuestion] });
  } catch (error) {
    console.error('MongoDB error, quiz will use fallback storage:', error);
    return NextResponse.json(
      { error: 'Database not available, using local storage' },
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
