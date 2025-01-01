'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookOpen, LineChart, TrendingUp, UserCog, Users } from 'lucide-react';
import Image from 'next/image';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import MaxWidthWrapper from './MaxWidthWrapper';
import { useAuth } from '../lib/hooks/useAuth';
import { useAuthStore, TradingLevel, AccountType } from '../lib/stores/authStore';
import { cn } from '../lib/utils';

interface UserInfo {
  address: string;
  email?: string;
  tradingLevel?: TradingLevel;
  accountType?: AccountType;
  lastSeen?: number;
  createdAt?: number;
  isOnboardingComplete: boolean;
}

interface UserData {
  address?: string | undefined;
  email?: string | undefined;
  tradingLevel: TradingLevel | null;
  accountType: AccountType | null;
  lastSeen?: number;
  createdAt?: number;
  isOnboardingComplete: boolean;
}

interface LevelOption {
  id: TradingLevel;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
}

interface AccountOption {
  id: AccountType;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
}

const tradingLevels: readonly LevelOption[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'New to trading, learning the basics',
    icon: BookOpen,
    image: 'https://www.dronakul.com/sitepad-data/uploads/2024/05/vecteezy_buy-or-sell-in-stock-market-and-crypto-currency-trading_.jpg'
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Familiar with trading concepts',
    icon: LineChart,
    image: '/intermediate.png'
  },
  {
    id: 'pro',
    title: 'Professional',
    description: 'Experienced trader with proven track record',
    icon: TrendingUp,
    image: 'https://tradebrains.in/wp-content/uploads/2020/10/How-to-do-Intraday-Trading-for-Beginners-In-India-cover.jpg'
  }
] as const;

const accountTypes: readonly AccountOption[] = [
  {
    id: 'standard',
    title: 'Standard Trader',
    description: 'Access AI-powered trading suggestions and portfolio management',
    icon: Users,
    image: 'https://img.freepik.com/premium-vector/afro-american-business-man-teal-background-vector-illustration_24877-20228.jpg'
  },
  {
    id: 'admin',
    title: 'Trade Admin',
    description: 'Manage multiple portfolios and create trading strategies',
    icon: UserCog,
    image: 'https://img.freepik.com/free-vector/network-businessminded-people_1308-37983.jpg'
  }
] as const;

const UserOnboarding: React.FC = () => {
  const router = useRouter();
  const { isConnected, address, saveUserData } = useAuth();
  const { userData, setUserData } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedLevel, setSelectedLevel] = useState<TradingLevel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      if (!isConnected || !address) {
        await router.push('/');
        return;
      }

      if (userData?.isOnboardingComplete) {
        const redirectPath = userData.accountType === 'admin' ? '/admin' : '/chats';
        await router.push(redirectPath);
      }
    };

    checkAuth();
  }, [isConnected, address, userData, router]);

  // Set initial selected level from userData if it exists
  useEffect(() => {
    if (userData?.tradingLevel) {
      setSelectedLevel(userData.tradingLevel);
    }
  }, [userData?.tradingLevel]);

  const handleLevelSelect = useCallback((level: TradingLevel) => {
    setError(null);
    setSelectedLevel(level);
    
    const updatedData: UserData = {
      ...userData,
      address: address?.toLowerCase(),
      tradingLevel: level,
      accountType: null,
      isOnboardingComplete: false
    } as UserData;
    
    setUserData(updatedData);
    setCurrentStep(2);
  }, [setUserData, userData, address]);

  const handleAccountTypeSelect = useCallback(async (type: AccountType) => {
    try {
      setError(null);
      setIsSubmitting(true);

      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!selectedLevel) {
        throw new Error('Please select a trading level first');
      }

      const timestamp = Date.now();
      
      // First prepare the data for Firebase
      const updateData: UserInfo = {
        address: address.toLowerCase(),
        tradingLevel: selectedLevel,
        accountType: type,
        isOnboardingComplete: true,
        lastSeen: timestamp,
        createdAt: timestamp
      };

      // Save to Firebase
      await saveUserData(updateData);
      
      // Update local state with proper typing
      const updatedData: UserData = {
        address: address.toLowerCase(),
        tradingLevel: selectedLevel,
        accountType: type,
        isOnboardingComplete: true,
        lastSeen: timestamp,
        createdAt: timestamp
      };
      
      setUserData(updatedData);

      // Redirect based on account type
      const redirectPath = type === 'admin' ? '/admin' : '/chats';
      await router.push(redirectPath);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [address, selectedLevel, saveUserData, setUserData, router]);

  // Early return if not authenticated
  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <MaxWidthWrapper>
        <div className="py-16">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 1 ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3">Welcome! Let&apos;s get started</h1>
                <p className="text-gray-600">What&apos;s your trading experience level?</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {tradingLevels.map((level) => {
                  const Icon = level.icon;
                  return (
                    <Card
                      key={level.id}
                      className={cn(
                        "relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                        selectedLevel === level.id && "ring-2 ring-purple-500"
                      )}
                      onClick={() => handleLevelSelect(level.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleLevelSelect(level.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-full bg-purple-100">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold">{level.title}</h3>
                        <p className="text-gray-600 text-sm">{level.description}</p>
                        <div className="relative w-full h-32">
                          <Image
                            src={level.image}
                            alt={level.title}
                            unoptimized={true}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <ChevronRight className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3">Choose Your Account Type</h1>
                <p className="text-gray-600">Select the type of trading account you want to set up</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {accountTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className={cn(
                        "relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                        isSubmitting && "opacity-50 pointer-events-none"
                      )}
                      onClick={() => handleAccountTypeSelect(type.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleAccountTypeSelect(type.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-full bg-purple-100">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold">{type.title}</h3>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                        <div className="relative w-full h-32">
                          <Image
                            src={type.image}
                            alt={type.title}
                            unoptimized={true}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <ChevronRight className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default UserOnboarding;