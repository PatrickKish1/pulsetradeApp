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
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { cn } from '../lib/utils';
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
  const [balance, setBalance] = useState<string>('0.0000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { isConnected, address, disconnectWallet, web3 } = useAuth();

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

  const renderMobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="lg:hidden p-2 rounded-full hover:bg-white/50 transition-colors"
          variant="ghost"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          {navLinks.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link
                href={link.href}
                className="w-full text-gray-700 hover:text-purple-600"
              >
                {link.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {isConnected && address ? (
          <>
            <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
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
                {isLoadingBalance ? 'Loading...' : `${balance} ETH`}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={disconnectWallet}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          <div className="px-2 py-1.5">
            <ConnectButton variant="outline" className="w-full" />
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderDesktopWallet = () => {
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
                  <span className="flex items-center">Loading...</span>
                ) : (
                  `${balance} ETH`
                )}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={disconnectWallet}
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
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={50} 
              height={50} 
              className="h-8 w-8 md:h-10 md:w-10"
              priority
            />
            <span className="text-lg md:text-xl font-bold text-purple-600">PULSE TRADE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-grow justify-center max-w-2xl mx-4">
            <div className="rounded-md backdrop-blur-md bg-white/30 px-2 py-1.5 shadow-sm border border-white/50 flex flex-wrap justify-center">
              {navLinks.map(renderNavLink)}
            </div>
          </nav>

          {/* Desktop Wallet */}
          <div className="hidden lg:block flex-shrink-0">
            {renderDesktopWallet()}
          </div>

          {/* Mobile Menu */}
          {renderMobileMenu()}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}