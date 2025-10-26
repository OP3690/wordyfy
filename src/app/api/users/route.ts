import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { User } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const userData: Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'xp' | 'level' | 'streak' | 'lastActive' | 'achievements'> = await request.json();
    
    const user: User = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: new Date(),
      achievements: []
    };

    const result = await db.collection('users').insertOne(user);
    
    return NextResponse.json({ 
      success: true, 
      userId: result.insertedId,
      user: { ...user, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
