import { Eip1193Provider } from 'ethers';

export type JsonRpcRequest = {
  method: string;
  params?: unknown[];
};

type EthereumProvider = Eip1193Provider & {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isWalletConnect?: boolean;
  autoRefreshOnNetworkChange?: boolean;
  _metamask?: {
    isUnlocked: () => Promise<boolean>;
  };
  request: <T = unknown>(args: JsonRpcRequest) => Promise<T>;
};

declare global {
  interface Window {
    ethereum: EthereumProvider;
  }
  const Buffer: typeof import('buffer').Buffer;
  const process: NodeJS.Process;

  namespace NodeJS {
    interface Process {
      browser: boolean;
    }
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};