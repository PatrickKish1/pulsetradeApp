'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/src/components/Header';
import { Button } from '@/src/components/ui/button';
import { usePayment } from '@/src/hooks/usePayment';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyPayment } = usePayment();
  const [paymentStatus, setPaymentStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    const verifyTransaction = async () => {
      // Get the reference from Paystack redirect
      const reference = searchParams.get('reference');

      if (!reference) {
        setPaymentStatus('failed');
        return;
      }

      try {
        // Verify the payment status
        const isSuccessful = await verifyPayment(reference);

        if (isSuccessful) {
          setPaymentStatus('success');
          
          // Optional: Show success message for a few seconds before redirecting
          setTimeout(() => {
            router.push('/predictions');
          }, 3000);
        } else {
          setPaymentStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
      }
    };

    verifyTransaction();
  }, [searchParams, verifyPayment, router]);

  const handleRetry = () => {
    router.push('/predictions');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          {paymentStatus === 'verifying' && (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your payment...</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="bg-green-100 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Payment Successful!</h2>
              <p className="text-green-600 mb-4">You now have full access to predictions.</p>
              <p className="text-sm text-gray-500">Redirecting to predictions...</p>
            </div>
  
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-100 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Payment Failed</h2>
              <p className="text-red-600 mb-4">We couldn't verify your payment. Please try again.</p>
              <Button onClick={handleRetry} className="bg-red-500 hover:bg-red-600 text-white">
                Back to Predictions
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}