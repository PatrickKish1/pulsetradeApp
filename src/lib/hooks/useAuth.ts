'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Web3 from 'web3';
import { useAuthStore } from '../stores/authStore';
import db from '../../../firebase.config';
import { useRouter } from 'next/navigation';

interface UserInfo {
  address: string;
  email?: string;
  lastSeen?: number;
  createdAt?: number;
}

interface UseAuthReturn {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  showModal: boolean;
  userInfo: UserInfo | null;
  web3: Web3 | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setShowModal: (show: boolean) => void;
}

// Type guard for ethereum object
const isEthereumAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const web3Ref = useRef<Web3 | null>(null);
  const authStore = useAuthStore();

  const updateUserData = useCallback(async (address: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', address.toLowerCase()));
      const timestamp = Date.now();
      
      const userData: UserInfo = {
        address: address.toLowerCase(),
        lastSeen: timestamp,
        ...(userDoc.exists() ? userDoc.data() as Omit<UserInfo, 'address'> : { createdAt: timestamp }),
      };

      await setDoc(
        doc(db, 'users', address.toLowerCase()),
        userData,
        { merge: true }
      );

      setUserInfo(userData);
    } catch (error) {
      console.error('Failed to update user data:', error);
      throw error;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      if (!isEthereumAvailable()) {
        const error = new Error('MetaMask is not installed. Please install MetaMask to continue.');
        authStore.setError(error.message);
        throw error;
      }

      // Initialize Web3
      if (!web3Ref.current) {
        web3Ref.current = new Web3(window.ethereum!);
      }

      // Request accounts
      let accounts: string[];
      try {
        accounts = await window.ethereum!.request<string[]>({
          method: 'eth_requestAccounts'
        });
      } catch (error: any) {
        // Handle common MetaMask errors
        let errorMessage = 'Failed to connect wallet';
        
        if (error?.code === 4001) {
          errorMessage = 'Please connect your wallet. Request was rejected.';
        } else if (error?.code === -32002) {
          errorMessage = 'Please unlock MetaMask and try again.';
        }
        
        authStore.setError(errorMessage);
        throw new Error(errorMessage);
      }

      if (!accounts || accounts.length === 0) {
        const error = new Error('No accounts found. Please check your MetaMask configuration.');
        authStore.setError(error.message);
        throw error;
      }

      // Update user data and state
      await updateUserData(accounts[0]);
      authStore.setAccount(accounts[0]);
      authStore.setConnected(true);
      authStore.setWeb3(web3Ref.current);
      setShowModal(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      authStore.setError(errorMessage);
      throw error;
    } finally {
      authStore.setLoading(false);
    }
  }, [authStore, updateUserData]);

  const disconnectWallet = useCallback(() => {
    authStore.reset();
    setUserInfo(null);
    web3Ref.current = null;
    router.push('/');
  }, [authStore, router]);

  // Handle wallet events
  useEffect(() => {
    if (!isEthereumAvailable()) return;

    const ethereum = window.ethereum!;

    const handleAccountsChanged = async (accounts: string[]) => {
      try {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== authStore.account) {
          await updateUserData(accounts[0]);
          authStore.setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error handling account change:', error);
        disconnectWallet();
      }
    };

    const handleChainChanged = () => {
      // Reload the page on chain change as recommended by MetaMask
      window.location.reload();
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log('MetaMask disconnect event:', error);
      disconnectWallet();
    };

    const handleConnect = (connectInfo: { chainId: string }) => {
      console.log('MetaMask connect event:', connectInfo);
    };

    // Add listeners
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('disconnect', handleDisconnect);
    ethereum.on('connect', handleConnect);

    // Check if already connected
    const checkInitialAccounts = async () => {
      try {
        const accounts = await ethereum.request<string[]>({ 
          method: 'eth_accounts' 
        });
        
        if (accounts && accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }
      } catch (error) {
        console.error('Error checking initial accounts:', error);
      }
    };

    checkInitialAccounts();

    // Remove listeners on cleanup
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
      ethereum.removeListener('disconnect', handleDisconnect);
      ethereum.removeListener('connect', handleConnect);
    };
  }, [authStore, disconnectWallet, updateUserData]);

  // Check initial connection
  useEffect(() => {
    const checkConnection = async () => {
      if (isEthereumAvailable() && authStore.isConnected) {
        try {
          const accounts = await window.ethereum!.request<string[]>({
            method: 'eth_accounts'
          });
          
          if (accounts && accounts.length > 0) {
            // Initialize Web3 if needed
            if (!web3Ref.current) {
              web3Ref.current = new Web3(window.ethereum!);
              authStore.setWeb3(web3Ref.current);
            }
            
            await updateUserData(accounts[0]);
            authStore.setAccount(accounts[0]);
          } else {
            disconnectWallet();
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
          disconnectWallet();
        }
      }
    };

    checkConnection();
  }, [authStore, disconnectWallet, updateUserData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      web3Ref.current = null;
    };
  }, []);

  return {
    address: authStore.account,
    isConnected: authStore.isConnected,
    isLoading: authStore.isLoading,
    error: authStore.error,
    showModal,
    userInfo,
    web3: web3Ref.current,
    connectWallet,
    disconnectWallet,
    setShowModal,
  };
}

export default useAuth;