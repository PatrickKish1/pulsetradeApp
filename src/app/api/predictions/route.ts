import { MongoClient } from 'mongodb';
import { Prediction } from '@/src/hooks/predictions';
import { NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB URI not configured' },
        { status: 500 }
      );
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB_NAME);
    
    const predictions = await db
      .collection(process.env.MONGODB_COLLECTION_NAME!)
      .find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    await client.close();
    
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}