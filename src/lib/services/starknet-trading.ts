import { Contract, Provider, Account, constants, CallData, hash, num, RpcProvider } from 'starknet';
import { toast } from 'react-hot-toast';
import { STARKNET_CONTRACT_ABI } from './abi-config';

// Configuration Types
interface StarkNetConfig {
  readonly contractAddress: string;
  readonly providerUrl: string;
}

// Domain Types
export interface TrustAgreement {
  user: string;
  admin: string;
  agreementTerms: string;
  isValid: boolean;
}

export interface AdminStats {
  trustScore: string;
  status: string;
  totalManagedAccounts: string;
  successRate: string;
}

export interface PropPool {
  id: string;
  totalAmount: string;
  active: boolean;
  params: string;
}

export interface PlatformStats {
  totalUsers: string;
  totalAdmins: string;
  totalTrades: string;
  activePoolsCount: string;
}

export interface VoteSubmission {
  admin: string;
  voteType: number;
  voteWeight: string;
}

export interface ContractEvent {
  data: string[];
  keys: string[];
  transactionHash: string;
}

interface ContractResponse {
  [key: string]: { toString: () => string };
}

// Static configuration
const STARKNET_CONFIG: StarkNetConfig = {
  contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', // Mainnet ETH contract
  providerUrl: 'https://starknet-mainnet.public.blastapi.io'
} as const;

export class StarkNetTradingService {
  private contract: Contract | null = null;
  private readonly provider: Provider;

  constructor() {
    this.provider = new RpcProvider({
      nodeUrl: STARKNET_CONFIG.providerUrl,
      chainId: constants.StarknetChainId.SN_MAIN
    });
  }

  public async initializeContract(accountAddress: string): Promise<void> {
    try {
      if (!this.isValidAddress(accountAddress)) {
        throw new Error('Invalid account address format');
      }

      const account = new Account(
        this.provider,
        accountAddress,
        constants.StarknetChainId.SN_MAIN
      );

      this.contract = new Contract(
        STARKNET_CONTRACT_ABI,
        STARKNET_CONFIG.contractAddress,
        account
      );

      toast.success('StarkNet contract initialized');
    } catch (error) {
      console.error('Failed to initialize StarkNet contract:', error);
      toast.error('Failed to initialize StarkNet contract');
      throw error;
    }
  }

  public async registerIdentity(
    credentials: string,
    proof: string
  ): Promise<boolean> {
    try {
      this.ensureContractInitialized();

      const calldata = CallData.compile({
        credentials: this.normalizeAndHashInput(credentials),
        proof: this.normalizeAndHashInput(proof)
      });

      const { transaction_hash } = await this.contract!.invoke(
        'register_identity',
        calldata
      );

      await this.provider.waitForTransaction(transaction_hash);
      toast.success('Identity registered successfully');
      return true;
    } catch (error) {
      this.handleError('Failed to register identity', error);
      return false;
    }
  }

  public async createTrustAgreement(
    admin: string,
    agreementTerms: string,
    signature: string
  ): Promise<boolean> {
    try {
      this.ensureContractInitialized();

      const calldata = CallData.compile({
        admin,
        terms: this.normalizeAndHashInput(agreementTerms),
        signature: this.normalizeAndHashInput(signature)
      });

      const { transaction_hash } = await this.contract!.invoke(
        'create_trust_agreement',
        calldata
      );

      await this.provider.waitForTransaction(transaction_hash);
      toast.success('Trust agreement created successfully');
      return true;
    } catch (error) {
      this.handleError('Failed to create trust agreement', error);
      return false;
    }
  }

  public async verifyTrustAgreement(
    user: string,
    admin: string
  ): Promise<boolean> {
    try {
      this.ensureContractInitialized();

      const result = await this.contract!.call('verify_trust_agreement', [
        user,
        admin
      ]);

      return result.toString() === '1';
    } catch (error) {
      this.handleError('Failed to verify trust agreement', error);
      return false;
    }
  }

  public async submitVote(params: VoteSubmission): Promise<boolean> {
    try {
      this.ensureContractInitialized();

      const calldata = CallData.compile({
        admin: params.admin,
        vote_type: params.voteType,
        vote_weight: params.voteWeight
      });

      const { transaction_hash } = await this.contract!.invoke(
        'submit_vote',
        calldata
      );

      await this.provider.waitForTransaction(transaction_hash);
      toast.success('Vote submitted successfully');
      return true;
    } catch (error) {
      this.handleError('Failed to submit vote', error);
      return false;
    }
  }

  public async validateVotes(
    admin: string,
    externalData: string
  ): Promise<boolean> {
    try {
      this.ensureContractInitialized();

      const calldata = CallData.compile({
        admin,
        external_data: this.normalizeAndHashInput(externalData)
      });

      const { transaction_hash } = await this.contract!.invoke(
        'validate_votes',
        calldata
      );

      await this.provider.waitForTransaction(transaction_hash);
      toast.success('Votes validated successfully');
      return true;
    } catch (error) {
      this.handleError('Failed to validate votes', error);
      return false;
    }
  }

  public async checkAdminStatus(admin: string): Promise<bigint> {
    try {
      this.ensureContractInitialized();

      const result = await this.contract!.call('check_admin_status', [admin]);
      return BigInt(result.toString());
    } catch (error) {
      this.handleError('Failed to check admin status', error);
      return BigInt(0);
    }
  }

  public async getPlatformStats(): Promise<PlatformStats> {
    try {
      this.ensureContractInitialized();

      const result = (await this.contract!.call('get_platform_stats')) as ContractResponse[];
      
      return {
        totalUsers: result[0].toString(),
        totalAdmins: result[1].toString(),
        totalTrades: result[2].toString(),
        activePoolsCount: result[3].toString()
      };
    } catch (error) {
      this.handleError('Failed to get platform stats', error);
      return {
        totalUsers: '0',
        totalAdmins: '0',
        totalTrades: '0',
        activePoolsCount: '0'
      };
    }
  }

  public async getAdminPerformance(admin: string): Promise<AdminStats> {
    try {
      this.ensureContractInitialized();

      const result = (await this.contract!.call('get_admin_performance', [admin])) as ContractResponse[];
      
      return {
        trustScore: result[0].toString(),
        status: result[1].toString(),
        totalManagedAccounts: result[2].toString(),
        successRate: result[3].toString()
      };
    } catch (error) {
      this.handleError('Failed to get admin performance', error);
      return {
        trustScore: '0',
        status: '0',
        totalManagedAccounts: '0',
        successRate: '0'
      };
    }
  }

  public onTrustAgreementCreated(
    callback: (agreement: TrustAgreement) => void
  ): void {
    this.ensureContractInitialized();

    this.contract!.on('TrustAgreementCreated', 
      (user: string, admin: string, terms: string) => {
        callback({
          user,
          admin,
          agreementTerms: terms,
          isValid: true
        });
      }
    );
  }

  public removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  // Private utility methods
  private ensureContractInitialized(): void {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initializeContract first.');
    }
  }

  private isValidAddress(address: string): boolean {
    return /^0x[0-9a-fA-F]{1,64}$/.test(address);
  }

  private normalizeAndHashInput(input: string): string {
    const normalized = input.toLowerCase().trim();
    // Using zero as the second argument for computePedersenHash as per StarkNet requirements
    const hashedValue = hash.computePedersenHash(normalized, '0');
    return num.toHex(hashedValue);
  }

  private handleError(message: string, error: unknown): void {
    console.error(`${message}:`, error);
    toast.error(message);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(message);
  }
}

// Factory function
export const createStarkNetTradingService = (): StarkNetTradingService => {
  return new StarkNetTradingService();
};