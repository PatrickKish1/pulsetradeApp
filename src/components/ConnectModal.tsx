'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../lib/hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import useWeb3Mail from '../lib/hooks/useWeb3Mail';
import db from '../../firebase.config';
import { isValidEmail } from '../lib/utils';

interface ConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectModal({ open, onOpenChange }: ConnectModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailProcessing, setIsEmailProcessing] = useState(false);
  
  const {
    connectWallet,
    isLoading,
    error: authError
  } = useAuth();

  const { protectEmail } = useWeb3Mail();

  // Reset states when modal opens
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEmailError('');
      setEmail('');
      setIsEmailProcessing(false);
    }
    onOpenChange(newOpen);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setIsEmailProcessing(false);
    
    if (!email) {
      setEmailError('Email address is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setIsEmailProcessing(true);

      // Check if email exists in Firebase
      const emailDoc = await getDoc(doc(db, 'protected_emails', email));
      
      let protectedAddress;
      if (emailDoc.exists()) {
        // Use existing protected address
        protectedAddress = emailDoc.data().protectedAddress;
      } else {
        // Protect new email and store in Firebase
        protectedAddress = await protectEmail(email);
        await setDoc(doc(db, 'protected_emails', email), {
          protectedAddress,
          createdAt: Date.now(),
          email: email,
          isWeb3MailEnabled: true
        });
      }

      if (!protectedAddress) {
        throw new Error('Failed to protect email');
      }

      // Close modal and clear state
      handleOpenChange(false);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to connect with email');
    } finally {
      setIsEmailProcessing(false);
    }
  };

  const handleMetaMaskConnect = async () => {
    try {
      await connectWallet();
      handleOpenChange(false);
    } catch (error) {
      // Error handling is managed by useAuth
      console.error('Wallet connection error:', error);
    }
  };

  const displayError = authError || emailError;
  const isLoaderShowing = isLoading || isEmailProcessing;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent title='Connect' aria-description='connect-modal' aria-describedby='connect-modal' className="sm:max-w-[425px]">
        <DialogHeader title='connect' aria-description='connect-modal' aria-describedby='connect-modal'>
          <DialogTitle title='connect' aria-description='connect-modal' aria-describedby='connect-modal' className="text-2xl font-bold text-center mb-4">
            Connect to Platform
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {displayError && (
            <Alert aria-description='connect-modal' variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription aria-description='connect-modal'>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full h-14 text-lg font-medium relative"
              onClick={handleMetaMaskConnect}
              disabled={isLoaderShowing}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <Image
                    src="https://i.imgur.com/wZdJv6K.png"
                    alt="MetaMask"
                    unoptimized={true}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  <span>Connect with MetaMask</span>
                </div>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                disabled={isLoaderShowing}
                className="h-12"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p id="email-error" className="text-sm text-red-500">
                  {emailError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium"
              disabled={isLoaderShowing}
            >
              {isEmailProcessing ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue with Email'
              )}
            </Button>
          </form>

          <div className="text-xs text-center text-muted-foreground">
            <p>
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectModal;