import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { nextReview } from '@/lib/sm2';

export async function POST(request: NextRequest) {
  try {
    const { userId, wordId, quality } = await request.json();
    if (!userId || !wordId || quality == null) {
      return NextResponse.json(
        { error: 'userId, wordId, and quality (1-4) required' },
        { status: 400 }
      );
    }
    const q = Number(quality);
    if (q < 1 || q > 4) {
      return NextResponse.json({ error: 'quality must be 1 (again), 2 (hard), 3 (good), 4 (easy)' }, { status: 400 });
    }
    const db = await getDb();
    const { ObjectId } = await import('mongodb');
    const word = await db.collection('words').findOne({
      _id: ObjectId.isValid(wordId) ? new ObjectId(wordId) : wordId,
      userId,
    });
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }
    const interval = word.sm2Interval ?? 0;
    const easeFactor = word.sm2EaseFactor ?? 2.5;
    const repetitions = word.sm2Repetitions ?? 0;
    const result = nextReview(q, interval, easeFactor, repetitions);
    await db.collection('words').updateOne(
      { _id: word._id },
      {
        $set: {
          nextReviewAt: result.nextReviewAt,
          sm2Interval: result.interval,
          sm2EaseFactor: result.easeFactor,
          sm2Repetitions: result.repetitions,
          lastReviewed: new Date(),
        },
        $inc: { reviewCount: 1 },
      }
    );
    return NextResponse.json({
      success: true,
      nextReviewAt: result.nextReviewAt,
      interval: result.interval,
    });
  } catch (error) {
    console.error('Error recording review:', error);
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
  }
}
