"use client";

import Header from '@/src/components/Header';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import useAuth from '@/src/lib/hooks/useAuth';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import {useRouter} from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Label } from '@/src/components/ui/label';


interface PriceFeed {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
}

interface RiskMetrics {
  accountBalance: number;
  maxPositionSize: number;
  riskPerTrade: number;
  marginUsed: number;
  availableMargin: number;
}

interface TradeFormData {
  asset: string;
  type: 'Long' | 'Short';
  amount: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
}

// Mock data generators
const generateMockPriceFeeds = (): PriceFeed[] => [
  {
    symbol: 'BTC/USD',
    price: 45000 + Math.random() * 1000,
    change24h: 2.5 + Math.random() * 2,
    volume: 1250000000,
    high24h: 46500,
    low24h: 44200
  },
  {
    symbol: 'ETH/USD',
    price: 2500 + Math.random() * 100,
    change24h: -1.2 - Math.random() * 2,
    volume: 580000000,
    high24h: 2600,
    low24h: 2450
  },
  {
    symbol: 'SOL/USD',
    price: 98 + Math.random() * 5,
    change24h: 3.8 + Math.random() * 2,
    volume: 320000000,
    high24h: 102,
    low24h: 96
  }
];

const generateMockRiskMetrics = (): RiskMetrics => ({
  accountBalance: 50000,
  maxPositionSize: 5000,
  riskPerTrade: 1,
  marginUsed: 2500,
  availableMargin: 47500
});

// Price update interval (ms)
const PRICE_UPDATE_INTERVAL = 5000;

export default function TradingExecutionPage() {
  const { isConnected } = useAuth();
  const [priceFeeds, setPriceFeeds] = useState<PriceFeed[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    accountBalance: 0,
    maxPositionSize: 0,
    riskPerTrade: 0,
    marginUsed: 0,
    availableMargin: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trade form state
  const [tradeForm, setTradeForm] = useState<TradeFormData>({
    asset: '',
    type: 'Long',
    amount: 0,
    leverage: 1,
    stopLoss: 0,
    takeProfit: 0
  });

  // Load initial data and set up price feed updates
  useEffect(() => {
    if (!isConnected) return;

    const loadInitialData = () => {
      const feeds = generateMockPriceFeeds();
      setPriceFeeds(feeds);
      setRiskMetrics(generateMockRiskMetrics());
      setTradeForm(prev => ({
        ...prev,
        asset: feeds[0].symbol
      }));
      setIsLoading(false);
    };

    // Update prices periodically
    const updatePrices = () => {
      setPriceFeeds(generateMockPriceFeeds());
    };

    loadInitialData();
    const interval = setInterval(updatePrices, PRICE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleTradeSubmit = async () => {
    if (!tradeForm.asset || !tradeForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (tradeForm.amount > riskMetrics.maxPositionSize) {
      toast.error('Amount exceeds maximum position size');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate trade submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful trade
      toast.success('Trade executed successfully');
      
      // Reset form
      setTradeForm(prev => ({
        ...prev,
        amount: 0,
        leverage: 1,
        stopLoss: 0,
        takeProfit: 0
      }));

      // Update risk metrics
      setRiskMetrics(prev => ({
        ...prev,
        marginUsed: prev.marginUsed + (tradeForm.amount * tradeForm.leverage),
        availableMargin: prev.availableMargin - (tradeForm.amount * tradeForm.leverage)
      }));
    } catch (error) {
      toast.error('Failed to execute trade');
      console.error('Trade execution failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
        <div className="p-6">
          <Alert>
            <AlertDescription>
              Please connect your wallet to execute trades.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 mb-32">
      <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/trading')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Trading</h1>
          </div>
      <h1 className="text-2xl font-bold">Execute Trade</h1>

      {/* Price Feeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceFeeds.map(feed => (
          <Card key={feed.symbol}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{feed.symbol}</p>
                  <p className="text-2xl font-bold">
                    ${feed.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  feed.change24h >= 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {feed.change24h >= 0 ? '+' : ''}{feed.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <p>24h High</p>
                  <p className="font-medium">${feed.high24h.toLocaleString()}</p>
                </div>
                <div>
                  <p>24h Low</p>
                  <p className="font-medium">${feed.low24h.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p>Volume</p>
                  <p className="font-medium">${feed.volume.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trade Execution Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Asset</Label>
              <Select
                value={tradeForm.asset}
                onValueChange={(value) => setTradeForm(prev => ({ ...prev, asset: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {priceFeeds.map(feed => (
                    <SelectItem key={feed.symbol} value={feed.symbol}>
                      {feed.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Order Type</Label>
              <Select
                value={tradeForm.type}
                onValueChange={(value: 'Long' | 'Short') => setTradeForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Long">Long</SelectItem>
                  <SelectItem value="Short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount (USD)</Label>
              <Input
                type="number"
                value={tradeForm.amount || ''}
                onChange={(e) => setTradeForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Leverage</Label>
              <Select
                value={tradeForm.leverage.toString()}
                onValueChange={(value) => setTradeForm(prev => ({ ...prev, leverage: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leverage" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 10].map(lev => (
                    <SelectItem key={lev} value={lev.toString()}>
                      {lev}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stop Loss (%)</Label>
                <Input
                  type="number"
                  value={tradeForm.stopLoss || ''}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, stopLoss: Number(e.target.value) }))}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Take Profit (%)</Label>
                <Input
                  type="number"
                  value={tradeForm.takeProfit || ''}
                  onChange={(e) => setTradeForm(prev => ({ ...prev, takeProfit: Number(e.target.value) }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <Button 
              className="w-full mt-6" 
              onClick={handleTradeSubmit}
              disabled={isSubmitting || !tradeForm.asset || !tradeForm.amount}
            >
              {isSubmitting ? 'Executing Trade...' : 'Execute Trade'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Risk Management Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-500">Account Balance</p>
                <p className="text-xl font-bold">
                  ${riskMetrics.accountBalance.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Max Position Size</p>
                  <p className="text-xl font-bold">
                    ${riskMetrics.maxPositionSize.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Risk per Trade</p>
                  <p className="text-xl font-bold">{riskMetrics.riskPerTrade}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Margin Used</p>
                  <p className="text-xl font-bold text-yellow-600">
                    ${riskMetrics.marginUsed.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500">Available Margin</p>
                  <p className="text-xl font-bold text-green-600">
                    ${riskMetrics.availableMargin.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}