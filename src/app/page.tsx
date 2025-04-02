'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { LineChart, BarChart, Headphones, Building2, ArrowRightLeft } from 'lucide-react';
import Image from 'next/image';
import db from '../../firebase.config';
import Footer from '../components/Footer';
import Header from '../components/Header';
import MaxWidthWrapper from '../components/MaxWidthWrapper';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import UserOnboarding from '../components/UserOnBoarding';
import useAuth from '../lib/hooks/useAuth';
import { useAuthStore } from '../lib/stores/authStore';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Loader2 } from 'lucide-react';
import ConnectButton from '../components/ConnectButton';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
interface CacheEntry {
  status: boolean;
  timestamp: number;
}
const userStatusCache = new Map<string, CacheEntry>();

export default function HomePage() {
  const router = useRouter();
  const { isConnected, address, isLoading: isAuthLoading } = useAuth();
  const { userData, setUserData } = useAuthStore();
  
  // Local state
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Check user onboarding status
  const checkUserStatus = useCallback(async () => {
    if (!address || !isConnected) {
      setIsCheckingUser(false);
      setIsPageLoading(false);
      return;
    }

    const lowercaseAddress = address.toLowerCase();

    // Check cache first
    const cachedStatus = userStatusCache.get(lowercaseAddress);
    if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_DURATION) {
      if (cachedStatus.status) {
        router.push('/chats');
      }
      setIsCheckingUser(false);
      setIsPageLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', lowercaseAddress));
      const exists = userDoc.exists();
      const userData = userDoc.data();
      
      // Update cache
      userStatusCache.set(lowercaseAddress, {
        status: exists && userData?.isOnboardingComplete,
        timestamp: Date.now()
      });

      // Update auth store with user data if exists
      if (exists) {
        setUserData({
          address: lowercaseAddress,
          email: userData?.email,
          tradingLevel: userData?.tradingLevel || null,
          accountType: userData?.accountType || null,
          isOnboardingComplete: !!userData?.isOnboardingComplete,
          lastSeen: userData?.lastSeen,
          createdAt: userData?.createdAt
        });

        if (userData?.isOnboardingComplete) {
          router.push('/chats');
        }
      }
      
    } catch (error) {
      console.error('Error checking user status:', error);
      setError('Failed to verify user status. Please try again.');
    } finally {
      setIsCheckingUser(false);
      setIsPageLoading(false);
    }
  }, [address, isConnected, router, setUserData]);

  useEffect(() => {
    let mounted = true;
    
    const initializeCheck = async () => {
      if (mounted) {
        await checkUserStatus();
      }
    };

    initializeCheck();

    return () => {
      mounted = false;
    };
  }, [checkUserStatus]);

  const handleGetStarted = () => {
    if (!isConnected) {
      setHasClickedGetStarted(true);
    } else if (!userData?.isOnboardingComplete) {
      setHasClickedGetStarted(true);
    } else {
      router.push('/chats');
    }
  };

  const handleRetry = async () => {
    setError(null);
    setIsCheckingUser(true);
    setIsPageLoading(true);
    await checkUserStatus();
  };

  if (isPageLoading || isAuthLoading || isCheckingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Loading"
              unoptimized={true}
              width={128}
              height={128}
              className="animate-bounce rounded-full bg-fuchsia-700"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            onClick={handleRetry}
            className="mt-4 w-full"
            variant="outline"
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if ((isConnected && !userData?.isOnboardingComplete) || hasClickedGetStarted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <UserOnboarding />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
      <Header />
      <main className="flex-grow bg-slate-100">
        <MaxWidthWrapper>
          <div className="py-12 mb-32">
            {/* Hero Section */}
            <div className="grid md:grid-cols-2 gap-8 items-center mb-20">
              <div>
                <h1 className="text-5xl font-bold mb-6">
                  Revolutionize Your Trading Experience
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Our AI-powered platform offers seamless, secure, and intelligent trading services at your fingertips. 
                  Let our advanced AI make smart trading decisions while you maintain full control of your financial future.
                </p>
                <div className="flex gap-4">
                  <ConnectButton
                    label='Get Started' 
                    showIcon={false}
                    showDropdown={false}
                    className="bg-blue-500 text-2xl hover:bg-blue-600 p-6"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="w-full h-[400px] bg-yellow-100 rounded-lg p-6 relative">
                  <div className="absolute right-4 top-4">
                    <LineChart className="w-8 h-8 text-yellow-500" />
                  </div>
                  <Image 
                    src="/trading.png"
                    width={800}
                    height={800}
                    priority={true}
                    alt="Trading Platform Interface"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Sponsors Section */}
            <div className="mb-20 py-8 border-y border-gray-200">
              <div className="flex justify-between items-center gap-8 opacity-70">
                <Image
                width={400}
                height={400}
                src="/iexec.png"
                priority={true}
                alt="IExec Logo"
                className="h-12 object-contain"
                />
                <Image
                width={400}
                height={400}
                src="https://avatars.githubusercontent.com/u/79376588?s=200&v=4"
                unoptimized={true}
                alt="Spectral"
                className="h-12 object-contain"
                />
                <Image
                width={400}
                height={400}
                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdiscord.do%2Fwp-content%2Fuploads%2F2023%2F08%2FEncode-Club.jpg&f=1&nofb=1&ipt=89f11c505aa37966e127c28771d2024e05a1b6f591f6bfae4005968c59f740d8&ipo=images"
                unoptimized={true}
                alt="Encode"
                className="h-12 object-contain"
                />
                <Image
                width={400}
                height={400}
                src="https://images.squarespace-cdn.com/content/v1/5f9bcc27c14fc6134658484b/1721990813731-K96BI6QY7PKEGTO8MNIM/AiL1r5pP_400x400.jpg?format=300w"
                unoptimized={true}
                alt="Citrea"
                className="h-12 object-contain"
                />
                <Image
                width={400}
                height={400}
                src="https://images.squarespace-cdn.com/content/5f9bcc27c14fc6134658484b/ddde9c0b-4f58-4bd1-8ea3-7f0a4991dfc2/nethermind.png?content-type=image%2Fpng"
                unoptimized={true}
                alt="Nethermind"
                className="h-12 object-contain"
                />
                <Image
                width={400}
                height={400}
                src="https://cryptobenelux.com/wp-content/uploads/2021/09/Koii-Logo-blue-1.png"
                unoptimized={true}
                alt="Koii Network"
                className="h-12 object-contain" />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="space-y-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <LineChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>AI-Powered Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Advanced algorithms analyze market trends and provide real-time trading suggestions optimized for your portfolio.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="space-y-1">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Smart Portfolio Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Automated portfolio balancing and risk management powered by cutting-edge machine learning algorithms.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="space-y-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Seamless Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Connect your existing wallets and trading accounts for a unified trading experience.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Trading Section */}
            <div className="grid md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-xl p-8 mb-24">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Intelligent Trading Made Simple
                </h2>
                <p className="text-gray-600 mb-6">
                  Experience the power of AI-driven trading strategies. Our platform analyzes market patterns, predicts trends, and executes trades with precision, all while adapting to your risk preferences and investment goals.
                </p>
                <Button 
                  variant="default"
                  className="bg-blue-900 hover:bg-blue-800 p-5 text-lg"
                  onClick={handleGetStarted}
                >
                  Customize Your Strategy
                </Button>
              </div>
              <div className="relative">
                <Image 
                  src="/dashboard1.png"
                  width={800}
                  height={800}
                  priority={true}
                  alt="AI Trading Interface"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 bg-gray-900 text-white rounded-xl px-8 mb-20">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$10M+</div>
                <div className="text-gray-300">Trading Volume</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-gray-300">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-gray-300">Uptime</div>
              </div>
            </div>

            {/* Features Showcase Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center mt-24">
              <div className="space-y-12">
                <h2 className="text-4xl font-bold">
                  Streamlined Trading for Your Convenience
                </h2>
                <p className="text-gray-600">
                  Experience a seamless and efficient trading process designed to cater to your modern lifestyle.
                </p>

                <div className="space-y-8">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Effortless Account Creation</h3>
                      <p className="text-gray-600">Get started quickly by creating an account using your email address or social media profile.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Real-Time Transaction Tracking</h3>
                      <p className="text-gray-600">Stay informed with instant updates and notifications about your transactions.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">24/7 Customer Support</h3>
                      <p className="text-gray-600">Access round-the-clock assistance with our dedicated support team.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative w-full aspect-[4/5]">
                  <Image 
                    src="/mobile.png"
                    width={800}
                    height={800}
                    priority={true}
                    alt="Trading Platform Mobile Interface"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center py-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Trading?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of traders who have already enhanced their trading strategy with our AI-powered platform.
              </p>
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Start Trading Now
              </Button>
            </div>
          </div>
        </MaxWidthWrapper>
        <Footer />
      </main>
    </div>
  );
}