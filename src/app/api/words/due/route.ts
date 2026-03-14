import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }
    const db = await getDb();
    const now = new Date();
    const words = await db
      .collection('words')
      .find({
        userId,
        $or: [
          { nextReviewAt: { $lte: now } },
          { nextReviewAt: { $exists: false } },
          { nextReviewAt: null },
        ],
      })
      .sort({ nextReviewAt: 1 })
      .limit(50)
      .toArray();
    return NextResponse.json({ words });
  } catch (error) {
    console.error('Error fetching due words:', error);
    return NextResponse.json({ error: 'Failed to fetch due words' }, { status: 500 });
  }
}
