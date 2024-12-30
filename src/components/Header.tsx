'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, ChevronDown, Copy, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { cn } from '../lib/utils';
import { useClickOutside } from '../lib/hooks/useClickOutside';
import MaxWidthWrapper from './MaxWidthWrapper';
import { ConnectButton } from './ConnectButton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tutorials', label: 'Tutorials' },
  { href: '/chats', label: 'Chats' },
  { href: '/ai-chats', label: 'AI Chat' },
] as const;

type NavLink = typeof navLinks[number];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState<string>('0.0000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { isConnected, address, disconnectWallet, web3 } = useAuth();

  // Use click outside hook for mobile menu
  const mobileMenuRef = useClickOutside(() => {
    setIsMobileMenuOpen(false);
  });

  // Handle balance fetching
  useEffect(() => {
    const fetchBalance = async () => {
      if (web3 && address && isConnected) {
        try {
          setIsLoadingBalance(true);
          const balanceWei = await web3.eth.getBalance(address);
          const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
          setBalance(parseFloat(balanceEth).toFixed(4));
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance('0.0000');
        } finally {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();
  }, [web3, address, isConnected]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address has been copied to clipboard",
      });
    }
  };

  const renderAuthButton = () => {
    if (isConnected && address) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <span>{formatAddress(address)}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-between">
              <span className="font-mono text-xs truncate">{address}</span>
              <Copy 
                className="h-4 w-4 ml-2 cursor-pointer" 
                onClick={copyAddress}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="flex justify-between font-mono text-xs">
              <span>Balance:</span>
              <span>
                {isLoadingBalance ? (
                  <span className="flex items-center">
                    Loading...
                  </span>
                ) : (
                  `${balance} ETH`
                )}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={() => {
                disconnectWallet();
                setIsMobileMenuOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return <ConnectButton variant="outline" />;
  };

  const renderNavLink = (link: NavLink) => (
    <Link
      key={link.href}
      href={link.href}
      className="relative px-2 lg:px-4 py-2 text-sm lg:text-base font-medium text-gray-700 rounded-md hover:text-purple-600 hover:bg-gray-200 transition-all duration-200 group whitespace-nowrap"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {link.label}
      <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 border-b border-gray-200">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 z-50 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={50} 
              height={50} 
              className="h-8 w-8 md:h-10 md:w-10"
              priority
            />
            <span className="text-lg md:text-xl font-bold text-purple-600">Your App</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-grow justify-center max-w-2xl mx-4">
            <div className="rounded-md backdrop-blur-md bg-white/30 px-2 py-1.5 shadow-sm border border-white/50 flex flex-wrap justify-center">
              {navLinks.map(renderNavLink)}
            </div>
          </nav>

          {/* Auth Button */}
          <div className="hidden lg:block flex-shrink-0">
            {renderAuthButton()}
          </div>

          {/* Mobile Menu Button */}
          <Button
            className="lg:hidden p-2 rounded-full hover:bg-white/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            variant="ghost"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </Button>

          {/* Mobile Menu */}
          <div ref={mobileMenuRef}>
            {/* Mobile Menu Overlay */}
            <div
              className={cn(
                "fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
                isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            />

            {/* Mobile Menu Panel */}
            <div
              className={cn(
                "absolute top-0 right-0 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="flex flex-col h-full pt-20 pb-6 px-4">
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className="text-gray-700 hover:text-purple-600 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto">
                  {renderAuthButton()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}