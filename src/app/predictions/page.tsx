import { MongoClient } from 'mongodb';
import { Prediction } from '@/src/hooks/predictions';
import PredictionsClient from './predictions-client';

async function getPredictions(): Promise<Prediction[]> {
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
      .limit(100)
      .toArray();

    await client.close();
    
    return JSON.parse(JSON.stringify(predictions)) as Prediction[];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
}

export default async function PredictionsPage() {
  const initialPredictions = await getPredictions();
  
  return <PredictionsClient initialPredictions={initialPredictions} />;
}