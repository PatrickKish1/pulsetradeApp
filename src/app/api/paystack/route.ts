import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { doc, updateDoc } from 'firebase/firestore';
import db from '../../../../firebase.config';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return initializePayment(req, res);
    case 'GET':
      return verifyPayment(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function initializePayment(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { amount, email, userAddress,  } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: amount * 100, // Paystack uses kobo
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

    return res.status(200).json(response.data.data);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({ error: 'Payment initialization failed' });
  }
}

async function verifyPayment(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ error: 'Reference is required' });
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

    // Update user access in Firestore
    if (status === 'success') {
      const userRef = doc(db, 'users', metadata.userAddress);
      await updateDoc(userRef, {
        hasPaidAccess: true,
        lastPaidAccessAt: Date.now()
      });
    }

    return res.status(200).json({ 
      status: status === 'success' ? 'successful' : 'failed',
      userAddress: metadata.userAddress 
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
}