'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Web3 from 'web3';

interface AuthState {
  web3: Web3 | null;
  account: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setWeb3: (web3: Web3 | null) => void;
  setAccount: (account: string | null) => void;
  setConnected: (isConnected: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AuthState = {
  web3: null,
  account: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setWeb3: (web3) => set({ web3 }),
      
      setAccount: (account) => set({ account }),
      
      setConnected: (isConnected) => set({ isConnected }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'web3-auth-storage',
      // Only persist essential data
      partialize: (state) => ({
        account: state.account,
        isConnected: state.isConnected,
      }),
    }
  )
);

// Optional: Add type-safe selector hooks
export const useIsConnected = () => useAuthStore((state) => state.isConnected);
export const useAccount = () => useAuthStore((state) => state.account);
export const useWeb3 = () => useAuthStore((state) => state.web3);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);

export default useAuthStore;