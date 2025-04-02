'use client';

import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from '@/src/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/src/components/ui/card';
import Header from '@/src/components/Header';

// Contact information
const contactInfo = [
  {
    id: 'discord',
    title: 'Discord',
    value: 'https://discord.com/users/958051080531497031',
    description: 'Reach out on Discord',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.39-.444.885-.608 1.283a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.283.077.077 0 0 0-.079-.036c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.3 13.3 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
      </svg>
    ),
  },
  {
    id: 'email',
    title: 'Email',
    value: 'patrickkesh90@gmail.com',
    description: 'Send an email',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'telegram',
    title: 'Telegram',
    value: 'https://t.me/Riley_Cmd0',
    description: 'Message on Telegram',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
];

// QR Code Generator component
const QRCodeGenerator: React.FC<{ value: string }> = ({ value }) => {
  // This would normally use a QR code library, but for this example
  // we'll generate a placeholder image URL for the QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 w-48 h-48 bg-white p-2 rounded-md shadow-md">
        <img
          src={qrCodeUrl}
          alt="QR Code"
          className="w-full h-full"
          loading="lazy"
        />
      </div>
      <p className="text-sm text-center text-muted-foreground break-all max-w-xs">
        {value}
      </p>
    </div>
  );
};

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('discord');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Contact information copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <main>
        <Header />
      <div className="container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-purple-700">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Reach out to us through any of the following channels
          </p>
        </div>

        <Tabs
          defaultValue="discord"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            {contactInfo.map((contact) => (
              <TabsTrigger key={contact.id} value={contact.id} className="flex gap-2 items-center">
                {contact.icon}
                <span>{contact.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {contactInfo.map((contact) => (
            <TabsContent key={contact.id} value={contact.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-purple-800">
                    {contact.icon}
                    <span>{contact.title}</span>
                  </CardTitle>
                  <CardDescription>{contact.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-between">
                  <QRCodeGenerator value={contact.value} />
                  <div className="space-y-6 w-full md:w-1/2">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Connect with us</h3>
                      <p className="text-muted-foreground">
                        Scan the QR code or use the information below:
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                      <span className="font-mono text-sm break-all mr-2">{contact.value}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(contact.value)}
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (contact.id === 'email') {
                          window.location.href = `mailto:${contact.value}`;
                        } else {
                          window.open(contact.value, '_blank');
                        }
                      }}
                    >
                      {contact.id === 'email' ? 'Send Email' : `Open ${contact.title}`}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    We typically respond immediately or within a few hours any day.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
    </main>
    
  );
}