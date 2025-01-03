'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Loader2, Wallet, Copy, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/hooks/useAuth';
import { useAuthStore } from '../lib/stores/authStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { ConnectModal } from './ConnectModal';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from '../hooks/use-toast';

interface ConnectButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  label?: string;
  showDropdown?: boolean;
  showIcon?: boolean;
}

export function ConnectButton({ 
  variant = 'default',
  size = 'lg',
  className = '',
  label = 'Connect Wallet',
  showDropdown = true,
  showIcon = true
}: ConnectButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState<string>('0.0000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const { 
    connectWallet,
    disconnectWallet,
    web3,
    error: authError,
    isLoading: isAuthLoading,
  } = useAuth();

  const {
    account,
    isConnected,
    userData
  } = useAuthStore();

  // Memoize address formatting
  const formattedAddress = useMemo(() => {
    if (!account) return '';
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  }, [account]);

  // Fetch balance with debounce and error handling
  const fetchBalance = useCallback(async () => {
    if (!web3 || !account || !isConnected) {
      setBalance('0.0000');
      return;
    }

    try {
      setIsLoadingBalance(true);
      const balanceWei = await web3.eth.getBalance(account);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0.0000');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [web3, account, isConnected]);

  // Balance update effect with cleanup
  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const updateBalance = async () => {
      if (!mounted) return;
      await fetchBalance();
    };

    if (isConnected && account) {
      updateBalance();
      // Update balance every 30 seconds
      intervalId = setInterval(updateBalance, 30000);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchBalance, isConnected, account]);

  const copyAddress = useCallback(async () => {
    if (!account) return;
    
    try {
      await navigator.clipboard.writeText(account);
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
  }, [account]);

  const handleConnect = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnectWallet();
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [disconnectWallet, router]);

  // Loading state
  if (isAuthLoading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={`${className} min-w-[160px]`}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  // Connected state with dropdown
  if (isConnected && account && showDropdown) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger aria-description='connect-button' asChild>
            <Button 
              variant={variant}
              size={size}
              className={className}
            >
              {showIcon && <Wallet className="mr-2 h-5 w-5" />}
              {formattedAddress}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent aria-describedby='connect-button' align="end" className="w-56">
            <DropdownMenuLabel aria-describedby='connect-button'>
              Connected Account
              {userData?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  {userData.email}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem aria-description='connect-button' onClick={copyAddress} className="cursor-pointer">
              <span className="w-full font-mono text-xs">{account}</span>
              <Copy className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem aria-description='connect-button' className="font-mono text-xs">
              <span className="flex justify-between w-full">
                <span>Balance:</span>
                <span>
                  {isLoadingBalance ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `${balance} ETH`
                  )}
                </span>
              </span>
            </DropdownMenuItem>
            {userData?.tradingLevel && (
              <DropdownMenuItem className="font-mono text-xs">
                <span className="flex justify-between w-full">
                  <span>Level:</span>
                  <span className="capitalize">{userData.tradingLevel}</span>
                </span>
              </DropdownMenuItem>
            )}
            {userData?.accountType && (
              <DropdownMenuItem className="font-mono text-xs">
                <span className="flex justify-between w-full">
                  <span>Account:</span>
                  <span className="capitalize">{userData.accountType}</span>
                </span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={handleDisconnect}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {authError && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}
      </>
    );
  }

  // Connected state without dropdown (for mobile menu)
  if (isConnected && account && !showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuItem className="font-mono text-xs">
            <span className="flex justify-between w-full">
              <span>Balance:</span>
              <span>
                {isLoadingBalance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `${balance} ETH`
                )}
              </span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
    );
  }

  // Disconnected state
  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={`${className} min-w-[160px]`}
        onClick={handleConnect}
      >
        {showIcon && <Wallet className="mr-2 h-4 w-4" />}
        {label}
      </Button>

      <ConnectModal
        open={showModal}
        onOpenChange={setShowModal}
      />

      {authError && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
    </>
  );
}

export default ConnectButton;