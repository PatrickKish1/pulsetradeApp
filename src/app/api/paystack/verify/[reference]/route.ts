import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../../../../../firebase.config';

const PAYSTACK_SECRET_KEY = process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const reference = (await params).reference;
    
    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { status, metadata } = response.data.data;

    // Update payment status in Firebase
    const paymentRef = doc(db, 'payments', reference);
    await updateDoc(paymentRef, {
      status: status === 'success' ? 'successful' : 'failed',
      updatedAt: Date.now()
    });

    // Update user access if payment successful
    if (status === 'success' && metadata?.userAddress) {
      const userRef = doc(db, 'users', metadata.userAddress);
      await updateDoc(userRef, {
        hasPaidAccess: true,
        lastPaidAccessAt: Date.now()
      });
    }

    return NextResponse.json({
      status: status === 'success' ? 'successful' : 'failed',
      userAddress: metadata?.userAddress
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}