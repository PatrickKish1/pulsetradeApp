import { useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import useAuth from '../lib/hooks/useAuth';
import db from '../../firebase.config';


export const usePayment = () => {
  const { address } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const initializePayment = useCallback(async (amount: number) => {
    if (!address) {
      throw new Error('User not authenticated');
    }

    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Call your backend to initialize Paystack payment
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          email: `${address}@predictions.app`, 
          userAddress: address 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const { authorization_url, reference } = await response.json();

      // Redirect to Paystack payment page
      window.location.href = authorization_url;
      return { reference };
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentStatus('error');
      setIsProcessing(false);
      throw error;
    }
  }, [address]);

  const verifyPayment = useCallback(async (reference: string) => {
    if (!address) {
      throw new Error('User not authenticated');
    }

    try {
      // Verify payment with backend
      const response = await fetch(`/api/paystack/verify/${reference}`);

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const { status } = await response.json();
      return status === 'successful';
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }, [address]);

  const checkUserAccess = useCallback(async () => {
    if (!address) {
      return false;
    }

    try {
      const userRef = doc(db, 'users', address);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return false;
      }

      const userData = userDoc.data();
      return userData.hasPaidAccess || false;
    } catch (error) {
      console.error('Access check error:', error);
      return false;
    }
  }, [address]);

  return {
    initializePayment,
    verifyPayment,
    checkUserAccess,
    isProcessing,
    paymentStatus
  };
};









// import { useState, useCallback } from 'react';
// import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
// import db from '../../firebase.config';
// import useAuth from '../lib/hooks/useAuth';

// interface PaymentTransaction {
//   reference: string;
//   amount: number;
//   status: 'pending' | 'successful' | 'failed';
//   createdAt: number;
// }

// export const usePayment = () => {
//   const { address } = useAuth();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

//   const initializePayment = useCallback(async (amount: number) => {
//     if (!address) {
//       throw new Error('User not authenticated');
//     }

//     setIsProcessing(true);
//     setPaymentStatus('processing');

//     try {
//       // Call your backend to initialize Paystack payment
//       const response = await fetch('/api/paystack/initialize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           amount, 
//           email: `${address}@predictions.app`, 
//           userAddress: address 
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to initialize payment');
//       }

//       const { authorization_url, reference } = await response.json();

//       // Store transaction in Firebase
//       const transactionRef = doc(db, 'payments', reference);
//       await setDoc(transactionRef, {
//         userAddress: address,
//         amount,
//         status: 'pending',
//         createdAt: Date.now()
//       });

//       // Redirect to Paystack payment page
//       window.location.href = authorization_url;
//     } catch (error) {
//       console.error('Payment initialization error:', error);
//       setPaymentStatus('error');
//       setIsProcessing(false);
//     }
//   }, [address]);

//   const verifyPayment = useCallback(async (reference: string) => {
//     if (!address) {
//       throw new Error('User not authenticated');
//     }

//     try {
//       // Verify payment with backend
//       const response = await fetch(`/api/paystack/verify/${reference}`, {
//         method: 'GET'
//       });

//       if (!response.ok) {
//         throw new Error('Payment verification failed');
//       }

//       const { status } = await response.json();

//       // Update Firebase payment document
//       const transactionRef = doc(db, 'payments', reference);
//       await updateDoc(transactionRef, { 
//         status: status === 'success' ? 'successful' : 'failed' 
//       });

//       return status === 'success';
//     } catch (error) {
//       console.error('Payment verification error:', error);
//       return false;
//     }
//   }, [address]);

//   const checkUserAccess = useCallback(async () => {
//     if (!address) {
//       return false;
//     }

//     try {
//       const userRef = doc(db, 'users', address);
//       const userDoc = await getDoc(userRef);

//       if (!userDoc.exists()) {
//         return false;
//       }

//       const userData = userDoc.data();
//       return userData.hasPaidAccess || false;
//     } catch (error) {
//       console.error('Access check error:', error);
//       return false;
//     }
//   }, [address]);

//   return {
//     initializePayment,
//     verifyPayment,
//     checkUserAccess,
//     isProcessing,
//     paymentStatus
//   };
// };