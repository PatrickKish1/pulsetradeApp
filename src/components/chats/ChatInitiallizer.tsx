'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import useAuth from '@/src/lib/hooks/useAuth';
import { IExecDataProtector } from '@iexec/dataprotector';
import { BrowserProvider, Eip1193Provider } from 'ethers';
import useDataProtection from '@/src/lib/hooks/useDataProtectioon';
import db from '../../../firebase.config';

export const ChatInitializer = () => {
  const { address, isConnected, web3 } = useAuth();
  const { loading: protectionLoading, error: protectionError } = useDataProtection();
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      if (initialized || !address || !isConnected || !web3 || !window.ethereum) return;
      
      try {
        setLoading(true);

        // Check if user already exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', address.toLowerCase()));
        
        if (!userDoc.exists()) {
          let protectedDataAddress: string | undefined;
          
          // Initialize data protection if email exists
          // Note: Email handling would need to be implemented differently since we don't have getUserInfo
          const provider = new BrowserProvider(window.ethereum as Eip1193Provider);
          const dataProtector = new IExecDataProtector(provider);
          
          // Store user data in Firestore
          await setDoc(doc(db, 'users', address.toLowerCase()), {
            address: address.toLowerCase(),
            protectedDataAddress,
            isWeb3MailEnabled: !!protectedDataAddress,
            createdAt: Date.now(),
            lastSeen: Date.now()
          });
        } else {
          // Update last seen
          await setDoc(doc(db, 'users', address.toLowerCase()), {
            lastSeen: Date.now()
          }, { merge: true });
        }
        
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing user:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize user');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [address, isConnected, initialized, web3]);

  // Show loading state
  if (loading || protectionLoading) {
    return <div className="text-center py-4">Initializing secure chat...</div>;
  }

  // Show error state
  if (error || protectionError) {
    return (
      <div className="text-center py-4 text-red-500">
        Error: {error || protectionError}
      </div>
    );
  }

  // Return null when successfully initialized
  return null;
};

export default ChatInitializer;