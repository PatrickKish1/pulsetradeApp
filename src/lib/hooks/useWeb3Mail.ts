'use client';

import { useState } from 'react';
import { IExecWeb3mail } from '@iexec/web3mail';
import { IExecDataProtector } from '@iexec/dataprotector';
import { BrowserProvider } from 'ethers';
import { useAuth } from '../hooks/useAuth';

export const useWeb3Mail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { web3 } = useAuth();

  const getProvider = async () => {
    if (!window.ethereum) {
      throw new Error('No wallet provider available');
    }
    return new BrowserProvider(window.ethereum);
  };

  const protectEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!web3) {
        throw new Error('Web3 instance not available');
      }

      const provider = await getProvider();
      const dataProtector = new IExecDataProtector(provider);
      const protectedData = await dataProtector.core.protectData({
        data: { email },
        name: `Protected email for Web3Mail`,
      });
      return protectedData.address;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendWeb3Mail = async (
    recipientAddress: string,
    subject: string,
    content: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (!web3) {
        throw new Error('Web3 instance not available');
      }

      const provider = await getProvider();
      const web3mail = new IExecWeb3mail(provider);
      const { taskId } = await web3mail.sendEmail({
        emailSubject: subject,
        emailContent: content,
        protectedData: recipientAddress,
        contentType: 'text/plain',
        senderName: 'Web3 Chat',
        workerpoolAddressOrEns: 'prod-v8-learn.main.pools.iexec.eth',
      });
      return taskId;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    protectEmail,
    sendWeb3Mail,
    loading,
    error,
  };
};

export default useWeb3Mail;