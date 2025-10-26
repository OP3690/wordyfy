import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export interface QuizStats {
  _id?: string;
  userId: string;
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  averageAccuracy: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  lastQuizDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const statsCollection = db.collection<QuizStats>('quiz_stats');

    const stats = await statsCollection.findOne({ userId });

    if (!stats) {
      // Return default stats if user has no quiz history
      return NextResponse.json({
        stats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          totalScore: 0,
          averageAccuracy: 0,
          bestScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastQuizDate: null
        }
      });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz statistics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, quizScore, totalQuestions, accuracy, quizQuestions } = await request.json();

    if (!userId || quizScore === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: 'User ID, quiz score, and total questions are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const statsCollection = db.collection<QuizStats>('quiz_stats');
    const wordsCollection = db.collection('words');

    // Get current stats
    const currentStats = await statsCollection.findOne({ userId });

    const now = new Date();
    const isNewDay = !currentStats?.lastQuizDate || 
      new Date(currentStats.lastQuizDate).toDateString() !== now.toDateString();

    // Calculate new streak
    let newCurrentStreak = 1; // Start with 1 for this quiz
    if (currentStats && isNewDay) {
      newCurrentStreak = (currentStats.currentStreak || 0) + 1;
    }

    const newStats: Partial<QuizStats> = {
      userId,
      totalQuizzes: (currentStats?.totalQuizzes || 0) + 1,
      totalQuestions: (currentStats?.totalQuestions || 0) + totalQuestions,
      correctAnswers: (currentStats?.correctAnswers || 0) + quizScore,
      totalScore: (currentStats?.totalScore || 0) + quizScore,
      averageAccuracy: 0, // Will be calculated below
      bestScore: Math.max(currentStats?.bestScore || 0, quizScore),
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(currentStats?.longestStreak || 0, newCurrentStreak),
      lastQuizDate: now,
      updatedAt: now
    };

    // Calculate average accuracy
    newStats.averageAccuracy = Math.round(
      (newStats.correctAnswers! / newStats.totalQuestions!) * 100
    );

    if (currentStats) {
      // Update existing stats
      await statsCollection.updateOne(
        { userId },
        { $set: newStats }
      );
    } else {
      // Create new stats
      await statsCollection.insertOne({
        ...newStats,
        createdAt: now
      } as QuizStats);
    }

    // Update individual word quiz statistics if quiz questions are provided
    if (quizQuestions && Array.isArray(quizQuestions)) {
      console.log('🔄 Updating individual word quiz stats...');
      
      for (const question of quizQuestions) {
        const wordId = question._id || question.englishWord;
        const isCorrect = question.isCorrect || false;
        
        try {
          // Find the word in the database
          const word = await wordsCollection.findOne({ 
            $or: [
              { _id: wordId },
              { englishWord: question.englishWord }
            ]
          });
          
          if (word) {
            // Update word-level quiz stats
            const currentAppearances = word.quizAppearances || 0;
            const currentCorrectAnswers = word.quizCorrectAnswers || 0;
            
            const newAppearances = currentAppearances + 1;
            const newCorrectAnswers = currentCorrectAnswers + (isCorrect ? 1 : 0);
            const newAccuracy = Math.round((newCorrectAnswers / newAppearances) * 100);
            
            await wordsCollection.updateOne(
              { _id: word._id },
              {
                $set: {
                  quizAppearances: newAppearances,
                  quizCorrectAnswers: newCorrectAnswers,
                  quizAccuracy: newAccuracy
                }
              }
            );
            
            console.log(`✅ Updated word "${word.englishWord}": ${newAppearances} appearances, ${newCorrectAnswers} correct, ${newAccuracy}% accuracy`);
          }
        } catch (wordError) {
          console.error(`❌ Error updating word stats for ${question.englishWord}:`, wordError);
        }
      }
    }

    return NextResponse.json({ success: true, stats: newStats });
  } catch (error) {
    console.error('Error updating quiz stats:', error);
    return NextResponse.json(
      { error: 'Failed to update quiz statistics' },
      { status: 500 }
    );
  }
}
