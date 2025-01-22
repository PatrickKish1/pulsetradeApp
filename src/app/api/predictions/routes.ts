import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your Mongo URI to .env.local');
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB_NAME);
    const predictions = await db
      .collection(process.env.MONGODB_COLLECTION_NAME!)
      .find({})
      .sort({ timestamp: -1 })
      .toArray();

    await client.close();

    return NextResponse.json(predictions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}