import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { Sentence, CreateSentenceRequest } from '@/types/sentence';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    
    const [sentences, totalCount] = await Promise.all([
      db.collection('sentences')
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('sentences').countDocuments({ userId })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      sentences, 
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching sentences:', error);
    return NextResponse.json({ error: 'Failed to fetch sentences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body: CreateSentenceRequest & { userId: string } = await request.json();
    const { userId, text, type, author, source, tags } = body;

    if (!userId || !text || !type) {
      return NextResponse.json({ 
        error: 'User ID, text, and type are required' 
      }, { status: 400 });
    }

    const sentence: Omit<Sentence, '_id'> = {
      userId,
      text: text.trim(),
      type,
      author: author?.trim(),
      source: source?.trim(),
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('sentences').insertOne(sentence);

    return NextResponse.json({ 
      success: true, 
      message: 'Sentence added successfully',
      sentence: { ...sentence, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error adding sentence:', error);
    return NextResponse.json({ error: 'Failed to add sentence' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();
    const { sentenceId, userId, text, type, author, source } = body;

    if (!sentenceId || !userId || !text) {
      return NextResponse.json({ 
        error: 'Sentence ID, User ID, and text are required' 
      }, { status: 400 });
    }

    const result = await db.collection('sentences').updateOne(
      { _id: new ObjectId(sentenceId), userId: new ObjectId(userId) },
      { 
        $set: { 
          text: text.trim(),
          type: type || 'text',
          author: author?.trim(),
          source: source?.trim(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Sentence not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sentence updated successfully' 
    });
  } catch (error) {
    console.error('Error updating sentence:', error);
    return NextResponse.json({ error: 'Failed to update sentence' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const sentenceId = searchParams.get('id');
    const userId = searchParams.get('userId');

    console.log('🗑️ DELETE request received:');
    console.log('- Sentence ID:', sentenceId);
    console.log('- User ID:', userId);

    if (!sentenceId || !userId) {
      console.log('❌ Missing required parameters');
      return NextResponse.json({ 
        error: 'Sentence ID and User ID are required' 
      }, { status: 400 });
    }

    // Check if sentence exists first
    const existingSentence = await db.collection('sentences').findOne({
      _id: new ObjectId(sentenceId),
      userId: new ObjectId(userId)
    });

    console.log('🔍 Existing sentence found:', existingSentence ? 'YES' : 'NO');
    if (existingSentence) {
      console.log('- Sentence text:', existingSentence.text);
      console.log('- Sentence userId:', existingSentence.userId);
    }

    const result = await db.collection('sentences').deleteOne({
      _id: new ObjectId(sentenceId),
      userId: new ObjectId(userId)
    });

    console.log('🗑️ Delete result:', result);

    if (result.deletedCount === 0) {
      console.log('❌ No sentence deleted - sentence not found');
      return NextResponse.json({ error: 'Sentence not found' }, { status: 404 });
    }

    console.log('✅ Sentence deleted successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Sentence deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting sentence:', error);
    return NextResponse.json({ error: 'Failed to delete sentence' }, { status: 500 });
  }
}
