"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import useAuth from '@/src/lib/hooks/useAuth';
import { Web3Provider, createEthereumTradingService } from '@/src/lib/services/ethereum-trading';
import { createStarkNetTradingService } from '@/src/lib/services/starknet-trading';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@radix-ui/react-select';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';


// Define proper types for Ethereum provider
type EthereumWindow = Window & typeof globalThis & {
  ethereum?: Web3Provider;
}

interface TradeExecutionFormProps {
  subAccountAddress?: string;
}

export default function TradeExecutionForm({ subAccountAddress }: TradeExecutionFormProps) {
  const { address, isConnected } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [positionSize, setPositionSize] = useState<string>('');
  const [riskPercentage, setRiskPercentage] = useState<string>('1');
  const [orderType, setOrderType] = useState<string>('market');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate position size based on risk percentage
  const calculatePositionSize = (addressSize: string, risk: string) => {
    if (!addressSize || !risk) return;
    const size = (parseFloat(addressSize) * (parseFloat(risk) / 100)).toString();
    setPositionSize(size);
  };

  const executeTrade = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const ethereum = (window as EthereumWindow).ethereum;
    if (!ethereum) {
      toast.error('Ethereum provider not found');
      return;
    }

    setIsLoading(true);
    try {
      const ethService = createEthereumTradingService(
        process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!
      );

      await ethService.initializeContract(ethereum);

      await ethService.executeTrade({
        subAccountAddress: subAccountAddress || address,
        amount: ethers.parseEther(amount)
      });

      const starkNetService = createStarkNetTradingService(
        process.env.NEXT_PUBLIC_STARKNET_CONTRACT_ADDRESS!,
        process.env.NEXT_PUBLIC_STARKNET_PROVIDER_URL!
      );
      await starkNetService.initializeContract(address);

      if (subAccountAddress) {
        const isVerified = await starkNetService.verifyTrustAgreement(
          address,
          subAccountAddress
        );
        if (!isVerified) {
          throw new Error('Trust agreement verification failed');
        }
      }

      toast.success('Trade executed successfully');
      
      // Reset form
      setAmount('');
      setPositionSize('');
    } catch (error) {
      console.error('Trade execution failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Trade Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                calculatePositionSize(e.target.value, riskPercentage);
              }}
              min="0"
              step="0.01"
            />
          </div>

          {/* Risk Parameters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Risk Percentage</label>
            <Select 
              value={riskPercentage}
              onValueChange={(value) => {
                setRiskPercentage(value);
                calculatePositionSize(amount, value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk %" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5%</SelectItem>
                <SelectItem value="1">1%</SelectItem>
                <SelectItem value="2">2%</SelectItem>
                <SelectItem value="3">3%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Size Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Position Size</label>
            <Input
              type="text"
              value={positionSize}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">
              Calculated based on risk percentage
            </p>
          </div>

          {/* Order Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Order Type</label>
            <Select 
              value={orderType}
              onValueChange={setOrderType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
                <SelectItem value="stop">Stop Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Execute Button */}
          <Button
            className="w-full"
            onClick={executeTrade}
            disabled={isLoading || !amount || !orderType}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Executing...
              </div>
            ) : (
              'Execute Trade'
            )}
          </Button>

          {/* Additional Information */}
          {subAccountAddress && (
            <p className="text-sm text-gray-500 mt-2">
              Trading on behalf of: {subAccountAddress}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}