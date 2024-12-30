import Web3 from 'web3';

// Basic JSON-RPC request type
export type JsonRpcRequest = {
  method: string;
  params?: unknown[];
};

// Basic MetaMask error type
export interface MetaMaskError extends Error {
  code: number;
  message: string;
}

// Event types
type EventType = 'accountsChanged' | 'chainChanged' | 'connect' | 'disconnect';

// Event handler types
type AccountsChangedHandler = (accounts: string[]) => void;
type ChainChangedHandler = (chainId: string) => void;
type ConnectHandler = (info: { chainId: string }) => void;
type DisconnectHandler = (error: { code: number; message: string }) => void;

// Simplified Ethereum provider interface
interface EthereumProvider {
  isMetaMask?: boolean;
  selectedAddress?: string | null;
  chainId?: string;
  isConnected?: () => boolean;
  request<T = unknown>(args: JsonRpcRequest): Promise<T>;
  on(event: 'accountsChanged', handler: AccountsChangedHandler): void;
  on(event: 'chainChanged', handler: ChainChangedHandler): void;
  on(event: 'connect', handler: ConnectHandler): void;
  on(event: 'disconnect', handler: DisconnectHandler): void;
  removeListener(event: EventType, handler: AccountsChangedHandler | ChainChangedHandler | ConnectHandler | DisconnectHandler): void;
}

// Global window type extension
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Basic Web3 state interface
export interface Web3State {
  web3: Web3 | null;
  account: string | null;
  isConnected: boolean;
  error: string | null;
}

// Export provider type
export type { EthereumProvider, EventType };