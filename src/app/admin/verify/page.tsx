"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/src/components/ui/select';
import Header from '@/src/components/Header';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Textarea } from '@/src/components/ui/textarea';
import useAuth from '@/src/lib/hooks/useAuth';
import { Input } from '@/src/components/ui/input';
import { useRouter } from 'next/navigation';
import { Label } from '@/src/components/ui/label';



interface VerificationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// Simulate verification delays
const VERIFICATION_DELAY = 1500;

export default function AdminVerificationPage() {
  const { address, isConnected } = useAuth();
  const [userAddress, setUserAddress] = useState('');
  const [agreementTerms, setAgreementTerms] = useState('');
  const router = useRouter();
  const [profitShare, setProfitShare] = useState('20');
  const [isLoading, setIsLoading] = useState(false);
  
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    { 
      id: 1, 
      title: 'Identity Verification', 
      description: 'Verify your identity using credentials',
      completed: false 
    },
    { 
      id: 2, 
      title: 'Trust Agreement Creation', 
      description: 'Create a new trust agreement with a user',
      completed: false 
    },
    { 
      id: 3, 
      title: 'Admin Status Check', 
      description: 'Verify your admin status and permissions',
      completed: false 
    }
  ]);

  const verifyIdentity = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, VERIFICATION_DELAY));
      
      updateStepStatus(1, true);
      toast.success('Identity verified successfully');
    } catch (error) {
      console.error('Identity verification failed:', error);
      toast.error('Identity verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createAgreement = async () => {
    if (!userAddress) {
      toast.error('Please enter user address');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate agreement creation
      await new Promise(resolve => setTimeout(resolve, VERIFICATION_DELAY));

      updateStepStatus(2, true);
      toast.success('Trust agreement created successfully');
    } catch (error) {
      console.error('Agreement creation failed:', error);
      toast.error('Failed to create trust agreement');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      // Simulate status check
      await new Promise(resolve => setTimeout(resolve, VERIFICATION_DELAY));
      
      updateStepStatus(3, true);
      toast.success('Admin status verified');
    } catch (error) {
      console.error('Status check failed:', error);
      toast.error('Failed to verify admin status');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStepStatus = (stepId: number, completed: boolean) => {
    setVerificationSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, completed } : step
      )
    );
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ecf0f1]">
        <Header />
        <div className="p-6">
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Please connect your wallet to proceed with verification.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 mb-48">
      <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Admin</h1>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Verification</h1>
          <p className="text-gray-500 mt-1">Complete all steps to become a verified admin</p>
        </div>
      </div>

      {/* Verification Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {verificationSteps.map((step) => (
          <Card key={step.id} className={step.completed ? 'border-green-500' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-gray-500">Step {step.id} of 3</p>
                </div>
                {step.completed ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Shield className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="text-sm text-gray-500">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Identity Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Verify your identity to proceed with admin registration. This step ensures secure and
            authenticated access to admin features.
          </p>
          <Button 
            onClick={verifyIdentity}
            disabled={isLoading || verificationSteps[0].completed}
          >
            {verificationSteps[0].completed ? 'Verified' : 'Verify Identity'}
          </Button>
        </CardContent>
      </Card>

      {/* Trust Agreement */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Agreement Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">User Address</Label>
            <Input
              placeholder="Enter user's wallet address"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              disabled={!verificationSteps[0].completed || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Profit Share (%)</Label>
            <Select 
              value={profitShare} 
              onValueChange={setProfitShare}
              disabled={!verificationSteps[0].completed || isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select profit share percentage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Agreement Terms</Label>
            <Textarea
              placeholder="Enter agreement terms and conditions"
              value={agreementTerms}
              onChange={(e) => setAgreementTerms(e.target.value)}
              rows={4}
              disabled={!verificationSteps[0].completed || isLoading}
            />
          </div>

          <Button
            onClick={createAgreement}
            disabled={!verificationSteps[0].completed || isLoading || verificationSteps[1].completed}
            className="w-full"
          >
            Create Agreement
          </Button>
        </CardContent>
      </Card>

      {/* Admin Status Check */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Status Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Verify your admin status and ensure all permissions are correctly set up.
          </p>
          <Button
            onClick={checkAdminStatus}
            disabled={!verificationSteps[1].completed || isLoading || verificationSteps[2].completed}
            className="w-full"
          >
            Verify Admin Status
          </Button>
        </CardContent>
      </Card>

      {verificationSteps.every(step => step.completed) && (
        <Alert popover='auto' className="bg-green-50 border-green-200">
          <AlertDescription className="flex items-center gap-2 text-green-800">
            <Check className="h-4 w-4" />
            All verification steps completed successfully. You are now a verified admin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}