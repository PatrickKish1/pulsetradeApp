import { NextResponse } from 'next/server';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import db from '../../../../../firebase.config';

const PAYSTACK_SECRET_KEY = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { amount, email, userAddress } = await request.json();

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: amount, // Already in the smallest currency unit
        email,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/predictions/payment-callback`,
        metadata: { userAddress }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const paymentData = response.data.data;

    // Store transaction in Firebase
    await setDoc(doc(db, 'payments', paymentData.reference), {
      userAddress,
      amount,
      status: 'pending',
      createdAt: Date.now()
    });

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json({ error: 'Payment initialization failed' }, { status: 500 });
  }
}