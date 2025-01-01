'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Web3 from 'web3';
import { useAuthStore, TradingLevel, AccountType } from '../stores/authStore';
import db from '../../../firebase.config';

interface UserInfo {
  address: string;
  email?: string;
  tradingLevel?: TradingLevel;
  accountType?: AccountType;
  lastSeen?: number;
  createdAt?: number;
  isOnboardingComplete: boolean;
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
  saveUserData: (data: Partial<UserInfo>) => Promise<void>;
  checkUserExists: (address: string) => Promise<boolean>;
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

  // Save user data to Firebase
  const saveUserData = useCallback(async (data: Partial<UserInfo>) => {
    if (!authStore.account) return;

    try {
      const timestamp = Date.now();
      const userRef = doc(db, 'users', authStore.account.toLowerCase());
      const userDoc = await getDoc(userRef);
      
      const userData: UserInfo = {
        address: authStore.account.toLowerCase(),
        lastSeen: timestamp,
        ...(userDoc.exists() ? userDoc.data() as Omit<UserInfo, 'address'> : { createdAt: timestamp }),
        ...data, // Spread the new data last to ensure it takes precedence
        isOnboardingComplete: data.isOnboardingComplete ?? false // Explicitly set after spread
      };

      await setDoc(userRef, userData, { merge: true });
      setUserInfo(userData);
      
      // Update auth store with new user data
      authStore.setUserData({
        address: userData.address,
        email: userData.email,
        tradingLevel: userData.tradingLevel || null,
        accountType: userData.accountType || null,
        isOnboardingComplete: userData.isOnboardingComplete,
        lastSeen: userData.lastSeen,
        createdAt: userData.createdAt
      });

    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }, [authStore]);

  // Check if user exists in Firebase
  const checkUserExists = useCallback(async (address: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', address.toLowerCase()));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserInfo;
        setUserInfo(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      authStore.setLoading(true);
      authStore.setError(null);

      if (!isEthereumAvailable()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
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
        let errorMessage = 'Failed to connect wallet';
        
        if (error?.code === 4001) {
          errorMessage = 'Please connect your wallet. Request was rejected.';
        } else if (error?.code === -32002) {
          errorMessage = 'Please unlock MetaMask and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please check your MetaMask configuration.');
      }

      const userAddress = accounts[0];
      
      // Check if user exists and has completed onboarding
      const exists = await checkUserExists(userAddress);
      const userDoc = exists ? await getDoc(doc(db, 'users', userAddress.toLowerCase())) : null;
      const userData = userDoc?.data() as UserInfo | undefined;
      
      // Update auth store with connection status
      authStore.setAccount(userAddress);
      authStore.setConnected(true);
      authStore.setWeb3(web3Ref.current);
      
      // If user exists and has completed onboarding, update their last seen
      if (exists && userData?.isOnboardingComplete) {
        await saveUserData({
          lastSeen: Date.now(),
          isOnboardingComplete: true,
          tradingLevel: userData.tradingLevel,
          accountType: userData.accountType
        });
        router.push('/chats');
      } else {
        // New user or incomplete onboarding - don't save to Firebase yet
        authStore.setUserData({
          address: userAddress,
          isOnboardingComplete: false,
          tradingLevel: null,
          accountType: null
        });
        router.push('/');
      }

      setShowModal(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      authStore.setError(errorMessage);
      throw error;
    } finally {
      authStore.setLoading(false);
    }
  }, [authStore, checkUserExists, saveUserData, router]);

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
          const exists = await checkUserExists(accounts[0]);
          if (exists) {
            await saveUserData({ lastSeen: Date.now() });
          }
          authStore.setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error handling account change:', error);
        disconnectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    // Add listeners
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);
    ethereum.on('disconnect', handleDisconnect);

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
    };
  }, [authStore, disconnectWallet, checkUserExists, saveUserData]);

  // Check initial connection
  useEffect(() => {
    const checkConnection = async () => {
      if (isEthereumAvailable() && authStore.isConnected && authStore.account) {
        try {
          const accounts = await window.ethereum!.request<string[]>({
            method: 'eth_accounts'
          });
          
          if (accounts && accounts.length > 0) {
            if (!web3Ref.current) {
              web3Ref.current = new Web3(window.ethereum!);
              authStore.setWeb3(web3Ref.current);
            }
            
            const exists = await checkUserExists(accounts[0]);
            if (exists) {
              await saveUserData({ lastSeen: Date.now() });
            }
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
  }, [authStore, disconnectWallet, checkUserExists, saveUserData]);

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
    saveUserData,
    checkUserExists,
  };
}

export default useAuth;