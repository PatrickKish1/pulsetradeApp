'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/useAuth';
import Web3 from 'web3';
import { Alert, AlertDescription } from '../components/ui/alert';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import db from '../../firebase.config';
import { useAuthStore } from './stores/authStore';

interface Web3ContextType {
  web3: Web3 | null;
}

interface AuthContextType {
  isInitialized: boolean;
  web3Context: Web3ContextType;
  error: string | null;
  checkUserOnboarding: (address: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  web3Context: {
    web3: null,
  },
  error: null,
  checkUserOnboarding: async () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { 
    isConnected,
    address,
    web3,
    error: authError,
    disconnectWallet
  } = useAuth();

  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    setUserData,
    isInitialized,
    initialize,
    userData
  } = useAuthStore();

  // Memoized checkUserOnboarding to prevent recreating on every render
  const checkUserOnboarding = useMemo(() => async (address: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', address.toLowerCase()));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isOnboardingComplete = userData.tradingLevel && userData.accountType;
        
        setUserData({
          address: address.toLowerCase(),
          tradingLevel: userData.tradingLevel || null,
          accountType: userData.accountType || null,
          isOnboardingComplete: !!isOnboardingComplete,
          lastSeen: userData.lastSeen,
          createdAt: userData.createdAt,
          email: userData.email
        });

        return !!isOnboardingComplete;
      }
      
      setUserData({
        address: address.toLowerCase(),
        isOnboardingComplete: false,
        tradingLevel: null,
        accountType: null
      });
      
      return false;
    } catch (error) {
      console.error('Error checking user onboarding status:', error);
      setError('Failed to verify user status');
      return false;
    }
  }, [setUserData]);

  const web3Context = useMemo(() => ({
    web3
  }), [web3]);

  const contextValue = useMemo(() => ({
    isInitialized,
    web3Context,
    error,
    checkUserOnboarding
  }), [isInitialized, web3Context, error, checkUserOnboarding]);

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        setError(null);
        
        if (isConnected && address && window.ethereum) {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          }) as string[];
            
          if (!accounts?.length) {
            disconnectWallet();
            throw new Error('No accounts found');
          }

          const hasCompletedOnboarding = await checkUserOnboarding(address);
          
          // Route based on onboarding status  && router.pathname !== '/'
          if (!hasCompletedOnboarding) {
            router.push('/');
          }

          const handleAccountsChanged = async (accounts: string[]) => {
            if (!accounts.length) {
              disconnectWallet();
            } else if (mounted) {
              await checkUserOnboarding(accounts[0]);
            }
          };

          window.ethereum.on('accountsChanged', handleAccountsChanged);
          cleanup = () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
          };
        }
      } catch (error) {
        if (mounted) {
          console.error('Auth initialization error:', error);
          setError(error instanceof Error ? error.message : 'Failed to initialize authentication');
          disconnectWallet();
        }
      } finally {
        if (mounted) {
          initialize();
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, [isConnected, address, disconnectWallet, initialize, router, checkUserOnboarding]);

  // Simplified storage event handler
  useEffect(() => {
    const handleStorageChange = () => {
      const persistedAuth = localStorage.getItem('web3-auth-storage');
      if (persistedAuth) {
        try {
          const { state } = JSON.parse(persistedAuth);
          if (state.isConnected && state.account && !isConnected) {
            window.location.reload();
          }
        } catch (error) {
          console.error('Error parsing persisted auth:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isConnected]);

  // Sync auth error only when it changes
  useEffect(() => {
    if (authError !== error) {
      setError(authError);
    }
  }, [authError, error]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex justify-center items-center h-64">
          <Image
            src="/logo.png"
            alt="Loading"
            priority={true}
            width={128}
            height={128}
            className="animate-pulse rounded-full bg-fuchsia-700"
          />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {error && (
        <Alert 
          variant="destructive" 
          className="fixed top-4 right-4 max-w-md z-50"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useWeb3 = () => {
  const { web3Context } = useAuthContext();
  return web3Context;
};

export default AuthProvider;