'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import Web3 from 'web3';
import { Alert, AlertDescription } from '../components/ui/alert';
import Image from 'next/image';

interface Web3ContextType {
  web3: Web3 | null;
}

interface AuthContextType {
  isInitialized: boolean;
  web3Context: Web3ContextType;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  web3Context: {
    web3: null,
  },
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth hook (must be first)
  const { 
    isConnected,
    address,
    web3,
    error: authError,
    disconnectWallet
  } = useAuth();

  // State declarations (group all useState together)
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized values (group all useMemo together)
  const web3Context = useMemo(() => ({
    web3
  }), [web3]);

  const contextValue = useMemo(() => ({
    isInitialized,
    web3Context,
    error,
  }), [isInitialized, web3Context, error]);

  // Side effects (group all useEffect together)
  useEffect(() => {
    let mounted = true;

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

          // Set up account change listener
          const handleAccountsChanged = (accounts: string[]) => {
            if (!accounts.length) {
              disconnectWallet();
            }
          };

          window.ethereum.on('accountsChanged', handleAccountsChanged);

          return () => {
            if (window.ethereum) {
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
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
          setIsInitialized(true);
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [isConnected, address, disconnectWallet]);

  useEffect(() => {
    setError(authError);
  }, [authError]);

  // Early return for loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex justify-center items-center h-64">
          <Image
            src="/logo.png"
            alt="Loading"
            width={48}
            height={48}
            className="animate-pulse"
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