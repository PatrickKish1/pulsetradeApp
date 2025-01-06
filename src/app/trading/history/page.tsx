"use client";

import { useState, useEffect, useCallback } from 'react';
import { Download, LineChart, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select';
import Header from '@/src/components/Header';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import useAuth from '@/src/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';




interface Trade {
  id: number;
  type: string;
  asset: string;
  amount: number;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  timestamp: number;
  leverage: number;
  fees: number;
}

interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  largestWin: number;
  largestLoss: number;
  averageTrade: number;
  winRate: number;
}

// Simulate API delay
const FETCH_DELAY = 1000;

// Mock data generators
const generateMockTrades = (): Trade[] => {
  const assets = ['BTC/USD', 'ETH/USD', 'SOL/USD'];
  const now = Date.now();
  const trades: Trade[] = [];

  for (let i = 0; i < 20; i++) {
    const type = Math.random() > 0.5 ? 'Long' : 'Short';
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const amount = Math.floor(Math.random() * 5000) + 1000;
    const entryPrice = Math.floor(Math.random() * 10000) + 30000;
    const priceChange = (Math.random() * 1000) - 500;
    const exitPrice = entryPrice + priceChange;
    const leverage = Math.floor(Math.random() * 5) + 1;
    const fees = amount * 0.001;

    trades.push({
      id: i + 1,
      type,
      asset,
      amount,
      entryPrice,
      exitPrice,
      profit: type === 'Long' ? 
        (exitPrice - entryPrice) * (amount / entryPrice) * leverage - fees :
        (entryPrice - exitPrice) * (amount / entryPrice) * leverage - fees,
      timestamp: now - (Math.random() * 30 * 24 * 60 * 60 * 1000),
      leverage,
      fees
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

export default function TradeHistoryPage() {
  const { address, isConnected } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const router = useRouter();
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    totalProfit: 0,
    largestWin: 0,
    largestLoss: 0,
    averageTrade: 0,
    winRate: 0
  });
  const [timeFilter, setTimeFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = useCallback((filteredTrades: Trade[]) => {
    const winningTrades = filteredTrades.filter(t => t.profit > 0);
    const losingTrades = filteredTrades.filter(t => t.profit < 0);
    const totalProfit = filteredTrades.reduce((sum, t) => sum + t.profit, 0);

    setStats({
      totalTrades: filteredTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalProfit,
      largestWin: Math.max(...filteredTrades.map(t => t.profit), 0),
      largestLoss: Math.min(...filteredTrades.map(t => t.profit), 0),
      averageTrade: totalProfit / filteredTrades.length || 0,
      winRate: (winningTrades.length / filteredTrades.length) * 100 || 0
    });
  }, []);

  const loadTradeHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, FETCH_DELAY));
      
      const mockTrades = generateMockTrades();

      // Apply filters
      let filteredTrades = [...mockTrades];
      
      if (timeFilter !== 'all') {
        const now = Date.now();
        const filterMap: Record<string, number> = {
          '24h': now - 86400000,
          '7d': now - 604800000,
          '30d': now - 2592000000
        };
        filteredTrades = filteredTrades.filter(
          trade => trade.timestamp >= filterMap[timeFilter]
        );
      }

      if (assetFilter !== 'all') {
        filteredTrades = filteredTrades.filter(trade => trade.asset === assetFilter);
      }

      setTrades(filteredTrades);
      calculateStats(filteredTrades);
    } catch (error) {
      console.error('Failed to load trade history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeFilter, assetFilter, calculateStats]);

  useEffect(() => {
    if (isConnected && address) {
      loadTradeHistory();
    }
  }, [isConnected, address, loadTradeHistory]);

  const exportTradeHistory = () => {
    const headers = [
      'ID',
      'Type',
      'Asset',
      'Amount',
      'Entry Price',
      'Exit Price',
      'Profit/Loss',
      'Leverage',
      'Fees',
      'Date'
    ];
    
    const csv = [
      headers.join(','),
      ...trades.map(trade => [
        trade.id,
        trade.type,
        trade.asset,
        trade.amount,
        trade.entryPrice,
        trade.exitPrice,
        trade.profit.toFixed(2),
        trade.leverage,
        trade.fees.toFixed(2),
        new Date(trade.timestamp).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-history-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading trade history...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
        <div className="p-6">
          <Alert>
            <AlertDescription>
              Please connect your wallet to view your trade history.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header and Controls */}
      <Header />
      <div className="flex justify-between items-center">
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
        <h1 className="text-2xl font-bold">Trade History</h1>
        <div className="flex gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assetFilter} onValueChange={setAssetFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="BTC/USD">BTC/USD</SelectItem>
              <SelectItem value="ETH/USD">ETH/USD</SelectItem>
              <SelectItem value="SOL/USD">SOL/USD</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportTradeHistory} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Profit/Loss</p>
                <p className={`text-2xl font-bold ${
                  stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${stats.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Largest Win</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.largestWin.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Largest Loss</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.largestLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Asset</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2 text-right">Entry Price</th>
                  <th className="px-4 py-2 text-right">Exit Price</th>
                  <th className="px-4 py-2 text-right">Leverage</th>
                  <th className="px-4 py-2 text-right">Fees</th>
                  <th className="px-4 py-2 text-right">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(trade => (
                  <tr key={trade.id} className="border-b">
                    <td className="px-4 py-2">
                      {new Date(trade.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        trade.type === 'Long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{trade.asset}</td>
                    <td className="px-4 py-2 text-right">
                      ${trade.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${trade.entryPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      ${trade.exitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right">{trade.leverage}x</td>
                    <td className="px-4 py-2 text-right">
                      ${trade.fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-2 text-right ${
                      trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${trade.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {trades.length === 0 && !isLoading && (
        <Alert>
          <AlertDescription>
            No trades found for the selected filters.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}