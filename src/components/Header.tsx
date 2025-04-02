'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, ChevronDown, Copy, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../lib/hooks/useAuth';
import { useAuthStore } from '../lib/stores/authStore';
import { cn } from '../lib/utils';
import MaxWidthWrapper from './MaxWidthWrapper';
import { ConnectButton } from './ConnectButton';

interface NavLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tutorials', label: 'Tutorials' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/chats', label: 'Chats', requiresAuth: true, requiresOnboarding: true },
  { href: '/ai-chats', label: 'AI Chat', requiresAuth: true, requiresOnboarding: true },
  { href: '/trading', label: 'Trading', requiresAuth: true, requiresOnboarding: true },
  { href: '/prop-firm', label: 'Prop Firm', requiresAuth: true, requiresOnboarding: true },
  { href: '/admin', label: 'Admin', requiresAuth: true },
  { href: '/predictions', label: 'Predictions', requiresAuth: true },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { address, isConnected, disconnectWallet } = useAuth();
  const { userData } = useAuthStore();
  const [isMoreNavOpen, setIsMoreNavOpen] = useState(false);
  const moreNavRef = useRef<HTMLDivElement>(null);

  const filteredNavLinks = useMemo(() => 
    navLinks.filter(link => {
      if (link.requiresAuth && !isConnected) return false;
      if (link.requiresOnboarding && !userData?.isOnboardingComplete) return false;
      return true;
    }),
    [isConnected, userData?.isOnboardingComplete]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreNavRef.current && 
          !moreNavRef.current.contains(event.target as Node)) {
        setIsMoreNavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast({
          title: "Address copied",
          description: "Wallet address has been copied to clipboard",
        });
      } catch (error) {
        console.error('Failed to copy address:', error);
        toast({
          title: "Error",
          description: "Failed to copy address to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const activeLink = filteredNavLinks.find(link => pathname === link.href);
  const primaryLinks = activeLink
    ? [activeLink, ...filteredNavLinks.filter(link => 
        link !== activeLink
      ).slice(0, 5)
    ]
    : filteredNavLinks.slice(0, 4);
  
  const additionalLinks = filteredNavLinks.filter(
    link => !primaryLinks.includes(link)
  );

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
        {filteredNavLinks.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link
              href={link.href}
              className={cn(
                "w-full text-gray-700 hover:text-purple-600",
                pathname === link.href && "text-purple-600 font-medium"
              )}
            >
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
        
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
            <ConnectButton variant="ghost" className="w-full" showDropdown={false} />
            {userData?.tradingLevel && (
              <DropdownMenuItem className="font-mono text-xs">
                <span className="flex justify-between w-full">
                  <span>Level:</span>
                  <span className="capitalize">{userData.tradingLevel}</span>
                </span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer"
              onClick={handleDisconnect}
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
      return <ConnectButton variant="outline" className="hidden lg:flex" />;
    }
    return <ConnectButton variant="outline" />;
  };

  const renderDesktopNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-1 flex-grow justify-center max-w-2xl mx-4">
      <MaxWidthWrapper>
        <div className="rounded-md backdrop-blur-md bg-white/30 px-2 py-1.5 shadow-sm border border-white/50 flex items-center">
          {primaryLinks.map(renderNavLink)}
          
          {additionalLinks.length > 0 && (
            <div 
              ref={moreNavRef}
              className="relative"
            >
              <button 
                onClick={() => setIsMoreNavOpen(!isMoreNavOpen)}
                className="flex items-center px-2 py-1 text-sm font-medium text-gray-700 rounded-md hover:text-purple-600 hover:bg-gray-200 transition-all duration-200 group"
              >
                More
                <ChevronDown 
                  className={cn(
                    "ml-1 h-4 w-4 transition-transform",
                    isMoreNavOpen ? "rotate-180" : ""
                  )} 
                />
              </button>
              
              {isMoreNavOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {additionalLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-purple-600",
                        pathname === link.href && "bg-purple-50 text-purple-600"
                      )}
                      onClick={() => setIsMoreNavOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </nav>
  );

  const renderNavLink = (link: NavLink) => (
    <Link
      key={link.href}
      href={link.href}
      className={cn(
        "relative px-2 lg:px-4 py-2 text-sm lg:text-base font-medium text-gray-700 rounded-md hover:text-purple-600 hover:bg-gray-200 transition-all duration-200 group whitespace-nowrap",
        pathname === link.href && "text-purple-600"
      )}
    >
      {link.label}
      <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-purple-500/0 via-purple-500/70 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 border-b border-gray-200">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              priority={true}
              width={50} 
              height={50} 
              className="h-8 w-8 md:h-10 md:w-10"
            />
            <span className="text-lg md:text-xl font-bold text-purple-600">PULSE TRADE</span>
          </Link>

          {renderDesktopNavigation()}

          <div className="hidden lg:block flex-shrink-0">
            {renderDesktopWallet()}
          </div>

          {renderMobileMenu()}
        </div>
      </MaxWidthWrapper>
    </header>
  );
}