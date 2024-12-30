import { IExec } from 'iexec';
import { BrowserProvider } from 'ethers';

// Initialize IExec only when ethereum is available
export const getIExec = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const provider = new BrowserProvider(window.ethereum);
    return new IExec({ ethProvider: provider });
  }
  throw new Error('Ethereum provider not found.');
};

export const registerOnIExec = async (emailOrWallet: string) => {
  try {
    const iexec = getIExec();
    // Mock registration (replace with actual Data Protector implementation)
    console.log('Registering on iExec:', emailOrWallet);
    console.log('Registering on iExec:', iexec);
    // Example: await iexec.dataProtector.register(emailOrWallet);
    return true;
  } catch (error) {
    console.error('iExec registration failed:', error);
    throw error;
  }
};