'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Loader2, Wallet, Copy } from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth';
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
}

export function ConnectButton({ 
  variant = 'default',
  size = 'lg',
  className = '',
  label = 'Connect Wallet'
}: ConnectButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState<string>('0.0000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  const { 
    isConnected, 
    address, 
    error,
    isLoading,
    disconnectWallet,
    web3,
    userInfo
  } = useAuth();

  // Fetch balance when address changes or connection status updates
  useEffect(() => {
    let mounted = true;

    const fetchBalance = async () => {
      if (web3 && address && isConnected) {
        try {
          setIsLoadingBalance(true);
          const balanceWei = await web3.eth.getBalance(address);
          const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
          if (mounted) {
            setBalance(parseFloat(balanceEth).toFixed(4));
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
          if (mounted) {
            setBalance('0.0000');
          }
        } finally {
          if (mounted) {
            setIsLoadingBalance(false);
          }
        }
      }
    };

    fetchBalance();

    return () => {
      mounted = false;
    };
  }, [web3, address, isConnected]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

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

  const handleConnect = () => {
    setShowModal(true);
  };

  if (isLoading) {
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

  if (isConnected && address) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={variant}
              size={size}
              className={className}
            >
              <Wallet className="mr-2 h-5 w-5" />
              {formatAddress(address)}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              Connected Account
              {userInfo?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  {userInfo.email}
                </p>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
              <span className="w-full font-mono text-xs">{address}</span>
              <Copy className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={disconnectWallet}
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </>
    );
  }

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={`${className} min-w-[160px]`}
        onClick={handleConnect}
      >
        <Wallet className="mr-2 h-4 w-4" />
        {label}
      </Button>

      <ConnectModal
        open={showModal}
        onOpenChange={setShowModal}
      />

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
}

export default ConnectButton;