'use client';

import Image from 'next/image';
interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({ message = 'Loading...' }: AuthLoadingProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
      <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex justify-center items-center h-64">
          <Image
            src="/logo.png"
            alt="logo Loading"
            priority={true}
            width={48}
            height={48}
            className="animate-pulse"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}