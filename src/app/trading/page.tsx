"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, History, DollarSign } from 'lucide-react';
import Header from '@/src/components/Header';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import useAuth from '@/src/lib/hooks/useAuth';


interface DashboardStats {
  totalBalance: number;
  openPositions: number;
  totalProfitLoss: number;
  winRate: number;
  marginUsed: number;
  availableBalance: number;
  dailyPnL: number;
  weeklyPnL: number;
}

interface RecentTrade {
  id: number;
  type: string;
  asset: string;
  amount: number;
  profit: number;
  leverage: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'cancelled';
}

// Mock data generator functions
const generateMockStats = (): DashboardStats => ({
  totalBalance: 100000 + Math.random() * 20000,
  openPositions: Math.floor(Math.random() * 5) + 2,
  totalProfitLoss: 5000 + Math.random() * 2000,
  winRate: 65 + Math.random() * 10,
  marginUsed: 25000 + Math.random() * 5000,
  availableBalance: 75000 + Math.random() * 15000,
  dailyPnL: 500 + Math.random() * 200,
  weeklyPnL: 2500 + Math.random() * 1000
});

const generateMockTrades = (): RecentTrade[] => {
  const trades: RecentTrade[] = [];
  const assets = ['BTC/USD', 'ETH/USD', 'SOL/USD'];
  const now = Date.now();

  for (let i = 0; i < 5; i++) {
    trades.push({
      id: i + 1,
      type: Math.random() > 0.5 ? 'Long' : 'Short',
      asset: assets[Math.floor(Math.random() * assets.length)],
      amount: 1000 + Math.random() * 5000,
      profit: (Math.random() * 1000) - 300,
      leverage: Math.floor(Math.random() * 5) + 1,
      timestamp: now - (Math.random() * 24 * 60 * 60 * 1000),
      status: i === 0 ? 'pending' : 'completed'
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

// Update interval for real-time data (ms)
const UPDATE_INTERVAL = 5000;

export default function TradingDashboard() {
  const { address, isConnected } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    openPositions: 0,
    totalProfitLoss: 0,
    winRate: 0,
    marginUsed: 0,
    availableBalance: 0,
    dailyPnL: 0,
    weeklyPnL: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!isConnected || !address) return;

    try {
      // Simulate real-time data updates
      const mockStats = generateMockStats();
      const mockTrades = generateMockTrades();

      setStats(mockStats);
      setRecentTrades(mockTrades);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    loadDashboardData();
    
    // Set up periodic updates
    if (isConnected) {
      const interval = setInterval(loadDashboardData, UPDATE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [loadDashboardData, isConnected]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card>
            <CardContent className="p-6">
              <p className="text-center">Please connect your wallet to view your trading dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 mb-32">
      <Header />
      <div className="flex justify-between items-center">
        <div className='mt-10'>
          <h1 className="text-2xl font-bold">Trading Dashboard</h1>
          <p className="text-gray-500">Real-time overview of your trading activity</p>
        </div>
        <Link href="/trading/execute">
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            New Trade
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold">${stats.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Available: ${stats.availableBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Open Positions</p>
                <p className="text-2xl font-bold">{stats.openPositions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Margin Used: ${stats.marginUsed.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total P/L</p>
                <p className={`text-2xl font-bold ${
                  stats.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${stats.totalProfitLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <div className="flex gap-2 mt-1 text-sm">
                  <span className={stats.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                    24h: {stats.dailyPnL >= 0 ? '+' : ''}{stats.dailyPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className={stats.weeklyPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                    7d: {stats.weeklyPnL >= 0 ? '+' : ''}{stats.weeklyPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500 mt-1">Performance Score</p>
              </div>
              <History className="h-5 w-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Trades</CardTitle>
            <Link href="/trading/history">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrades.map(trade => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      trade.type === 'Long' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.type}
                    </span>
                    <span className="font-medium">{trade.asset}</span>
                    {trade.status === 'pending' && (
                      <span className="px-2 py-1 rounded text-sm bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(trade.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${trade.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${trade.amount.toLocaleString()} • {trade.leverage}x
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}