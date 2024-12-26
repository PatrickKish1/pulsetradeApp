import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface User {
  address: string;
  email?: string;
  protectedDataAddress?: string;
  isWeb3MailEnabled: boolean;
  createdAt: number;
  lastSeen: number;
  socialInfo?: Record<string, string | number | boolean>;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  isWeb3Mail: boolean;
  protectedDataAddress?: string;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: {
    id: string;
    content: string;
    timestamp: number;
    senderId: string;
    recipientId: string;
  };
  unreadCount: Record<string, number>;
  createdAt: number;
  updatedAt: number;
  type: 'individual' | 'group';
  name?: string;
}

export interface AIMessage {
  id: string;
  content: string;
  isAi: boolean;
  timestamp: number;
  chatId: string;
}

export interface AIChat {
  id: string;
  userId: string;
  threadId: string;
  title: string;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface TradeValues {
  takeProfit: string;
  stopLoss: string;
  lotSize: string;
}

export interface AIResponse {
  response: {
    kwargs: {
      content: string;
    };
  };
  threadId: string;
}

export interface Web3MailConfig {
  workerpoolAddress: string;
  senderName: string;
  contentType: 'text/plain' | 'text/html';
}

export type Address = `0x${string}`;
export type AddressOrEnsName = Address | string;

export const isAddress = (value: string): value is Address => {
  return value.startsWith('0x') && value.length === 42;
};

export const IEXEC_EXPLORER_URL = 'https://explorer.iex.ec/bellecour/dataset/';
export const WEB3MAIL_APP_ENS = 'web3mail.apps.iexec.eth';
export const IEXEC_CHAIN_ID = '0x86'; // 134

export const DEFAULT_WEB3MAIL_CONFIG: Web3MailConfig = {
  workerpoolAddress: 'prod-v8-learn.main.pools.iexec.eth',
  senderName: 'Web3 Chat',
  contentType: 'text/plain'
};

interface ChainParams {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export function checkIsConnected(): Window['ethereum'] {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum provider found. Please install MetaMask or use a Web3 browser.');
  }
  return window.ethereum;
}

export async function checkCurrentChain(): Promise<void> {
  const provider = checkIsConnected();
  
  try {
    const currentChainId = await provider.request<string>({
      method: 'eth_chainId',
      params: [],
    });

    if (currentChainId !== IEXEC_CHAIN_ID) {
      console.log('Please switch to iExec chain');
      
      const chainParams: ChainParams = {
        chainId: '0x86',
        chainName: 'iExec Sidechain',
        nativeCurrency: {
          name: 'xRLC',
          symbol: 'xRLC',
          decimals: 18,
        },
        rpcUrls: ['https://bellecour.iex.ec'],
        blockExplorerUrls: ['https://blockscout-bellecour.iex.ec'],
      };
      
      await provider.request<null>({
        method: 'wallet_addEthereumChain',
        params: [chainParams],
      });
      
      console.log('Switched to iExec chain');
    }
  } catch (err) {
    console.error('Failed to switch to iExec chain:', err);
    throw err;
  }
}