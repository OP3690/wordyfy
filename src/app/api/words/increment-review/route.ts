import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { englishWord, userId } = await request.json();
    
    if (!englishWord || !userId) {
      return NextResponse.json({ error: 'English word and userId are required' }, { status: 400 });
    }

    // Find and increment the review count for the specific word and user
    const result = await db.collection('words').updateOne(
      { 
        englishWord: englishWord.toLowerCase(),
        userId: userId
      },
      { 
        $inc: { reviewCount: 1 },
        $set: { lastReviewed: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Review count incremented successfully' 
    });
  } catch (error) {
    console.error('Error incrementing review count:', error);
    return NextResponse.json({ error: 'Failed to increment review count' }, { status: 500 });
  }
}
