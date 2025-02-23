import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from 'react';
import { AuthProvider } from "../lib/AuthProvider";
import { Toaster } from "../components/ui/toaster";
import { ThemeProvider } from "../lib/ThemeProvider";
import Image from "next/image";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PULSE TRADE AI",
  description: "The OP trading ai platform",
  icons: '/next.svg'
};

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="flex animate-bounce justify-center items-center h-64">
                <Image
                  src="/logo.png"
                  alt="Loading"
                  priority={true}
                  width={128}
                  height={128}
                  className="rounded-full bg-fuchsia-700"
                />
              </div>
            </div>
          }>
            <AuthProvider>
              {children}
            </AuthProvider>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}