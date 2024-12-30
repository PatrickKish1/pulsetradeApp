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

// Cache user status checks to prevent excessive Firestore reads
const userStatusCache = new Map<string, { status: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Index() {
  const router = useRouter();
  const { isConnected, address, isLoading } = useAuth();
  const [hasClickedGetStarted, setHasClickedGetStarted] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkUserStatus = useCallback(async () => {
    if (!address || !isConnected) {
      setIsCheckingUser(false);
      return;
    }

    const lowercaseAddress = address.toLowerCase();

    // Check cache first
    const cachedStatus = userStatusCache.get(lowercaseAddress);
    if (cachedStatus && Date.now() - cachedStatus.timestamp < CACHE_DURATION) {
      setNeedsOnboarding(!cachedStatus.status);
      setIsCheckingUser(false);
      if (cachedStatus.status) {
        router.push('/chats');
      }
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', lowercaseAddress));
      const exists = userDoc.exists();
      
      // Update cache
      userStatusCache.set(lowercaseAddress, {
        status: exists,
        timestamp: Date.now()
      });

      if (exists) {
        setNeedsOnboarding(false);
        router.push('/chats');
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setError('Failed to verify user status. Please try again.');
      setNeedsOnboarding(true);
    } finally {
      setIsCheckingUser(false);
    }
  }, [address, isConnected, router]);

  useEffect(() => {
    let mounted = true;
    
    const checkStatus = async () => {
      if (mounted) {
        await checkUserStatus();
      }
    };

    checkStatus();

    return () => {
      mounted = false;
    };
  }, [checkUserStatus]);

  const handleGetStarted = () => {
    setHasClickedGetStarted(true);
  };

  const handleRetry = async () => {
    setError(null);
    setIsCheckingUser(true);
    await checkUserStatus();
  };

  if (isCheckingUser || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"> 
        <div className="flex justify-center items-center h-64">
          <Image
            src="/logo.png"
            alt="Loading"
            width={48}
            height={48}
            className="animate-pulse"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    );
  }

  if ((isConnected && needsOnboarding) || hasClickedGetStarted) {
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
                  Our AI-powered platform offers seamless, secure, and intelligent trading services at your fingertips. Let our advanced AI make smart trading decisions while you maintain full control of your financial future.
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-blue-500 text-2xl hover:bg-blue-600 p-6"
                  >
                    Get Started
                  </Button>
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
                    alt="Trading Platform Interface"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Sponsors Section */}
            <div className="mb-20 py-8 border-y border-gray-200">
              <div className="flex justify-between items-center gap-8 opacity-70">
                <Image width={400} height={400} src="/iexec.png" alt="IExec Logo" className="h-12 object-contain" />
                <Image width={400} height={400} src="https://avatars.githubusercontent.com/u/79376588?s=200&v=4" unoptimized alt="Spectral" className="h-12 object-contain" />
                <Image width={400} height={400} src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdiscord.do%2Fwp-content%2Fuploads%2F2023%2F08%2FEncode-Club.jpg&f=1&nofb=1&ipt=89f11c505aa37966e127c28771d2024e05a1b6f591f6bfae4005968c59f740d8&ipo=images" unoptimized alt="Encode" className="h-12 object-contain" />
                <Image width={400} height={400} src="https://images.squarespace-cdn.com/content/v1/5f9bcc27c14fc6134658484b/1721990813731-K96BI6QY7PKEGTO8MNIM/AiL1r5pP_400x400.jpg?format=300w" unoptimized alt="Citrea" className="h-12 object-contain" />
                <Image width={400} height={400} src="https://images.squarespace-cdn.com/content/5f9bcc27c14fc6134658484b/ddde9c0b-4f58-4bd1-8ea3-7f0a4991dfc2/nethermind.png?content-type=image%2Fpng" unoptimized alt="Nethermind" className="h-12 object-contain" />
                <Image width={400} height={400} src="https://cryptobenelux.com/wp-content/uploads/2021/09/Koii-Logo-blue-1.png" unoptimized alt="Koii Network" className="h-12 object-contain" />
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-12">
                Discover the Advantages of Trading with AI
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-gray-50">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <CardTitle>Smart Security</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-600">
                    Enterprise-grade security with advanced AI monitoring to protect your investments and trading activities.
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <BarChart className="w-6 h-6 text-yellow-600" />
                    </div>
                    <CardTitle>AI-Powered Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-600">
                    Advanced algorithms analyze market trends and provide real-time trading suggestions optimized for your portfolio.
                  </CardContent>
                </Card>

                <Card className="bg-gray-50">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <CardTitle>Portfolio Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-600">
                    Smart portfolio management and diversification strategies powered by machine learning algorithms.
                  </CardContent>
                </Card>
              </div>
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
                  alt="AI Trading Interface"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 py-12 bg-gray-900 text-white mt-28 mb-20 rounded-xl px-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10+</div>
                <div className="text-gray-300">Years of Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">555+</div>
                <div className="text-gray-300">Satisfied Clients</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">10+</div>
                <div className="text-gray-300">Awards Achieved</div>
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
                    alt="Trading Platform Mobile Interface"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
        <Footer />
      </main>
    </div>
  );
}