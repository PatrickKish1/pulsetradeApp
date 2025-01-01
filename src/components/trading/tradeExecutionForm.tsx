"use client";

import { useState, useEffect, useCallback } from 'react';
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
};

interface TradeExecutionFormProps {
  subAccountAddress?: string;
}

export default function TradeExecutionForm({ subAccountAddress }: TradeExecutionFormProps) {
  const { address, isConnected } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [positionSize, setPositionSize] = useState<string>('');
  const [riskPercentage, setRiskPercentage] = useState<string>('1');
  const [orderType, setOrderType] = useState<string>('market');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasVerifiedTrust, setHasVerifiedTrust] = useState<boolean>(false);

  // Initialize services
  const starkNetService = createStarkNetTradingService();
  
  // Verify trust agreement on mount if subAccountAddress exists
  useEffect(() => {
    const verifyTrust = async () => {
      if (!subAccountAddress || !address || !isConnected) return;
      
      try {
        await starkNetService.initializeContract(address);
        const isVerified = await starkNetService.verifyTrustAgreement(
          address,
          subAccountAddress
        );
        setHasVerifiedTrust(isVerified);
        
        if (!isVerified) {
          toast.error('Trust agreement not verified for this account');
        }
      } catch (error) {
        console.error('Trust verification failed:', error);
        setHasVerifiedTrust(false);
      }
    };

    verifyTrust();
  }, [address, subAccountAddress, isConnected]);

  // Calculate position size based on risk percentage
  const calculatePositionSize = useCallback((amountSize: string, risk: string) => {
    if (!amountSize || !risk) return;
    try {
      const size = (parseFloat(amountSize) * (parseFloat(risk) / 100)).toString();
      setPositionSize(size);
    } catch (error) {
      console.error('Position size calculation failed:', error);
      toast.error('Invalid input for position size calculation');
    }
  }, []);

  const executeTrade = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (subAccountAddress && !hasVerifiedTrust) {
      toast.error('Trust agreement not verified');
      return;
    }

    const ethereum = (window as EthereumWindow).ethereum;
    if (!ethereum) {
      toast.error('Ethereum provider not found');
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Ethereum service
      const ethService = createEthereumTradingService(
        process.env.NEXT_PUBLIC_ETH_CONTRACT_ADDRESS!
      );
      await ethService.initializeContract(ethereum);

      // Execute trade on Ethereum
      await ethService.executeTrade({
        subAccountAddress: subAccountAddress || address,
        amount: ethers.parseEther(amount)
      });

      // Record trade on StarkNet
      await starkNetService.initializeContract(address);
      
      // Additional StarkNet operations can be added here
      // For example, updating platform stats or recording the trade

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

  const isExecuteDisabled = useCallback((): boolean => {
    // Convert amount to boolean context properly
    const hasAmount = amount !== undefined && amount !== null && amount !== '';
    // Ensure all conditions return boolean values
    return Boolean(
      isLoading || 
      !hasAmount || 
      !orderType || 
      (subAccountAddress && !hasVerifiedTrust)
    );
  }, [isLoading, amount, orderType, subAccountAddress, hasVerifiedTrust]);

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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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

          {/* Trust Agreement Warning */}
          {subAccountAddress && !hasVerifiedTrust && (
            <p className="text-sm text-red-500">
              Trust agreement not verified for this account
            </p>
          )}

          {/* Execute Button */}
          <Button
            className="w-full"
            onClick={executeTrade}
            disabled={isExecuteDisabled()}
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