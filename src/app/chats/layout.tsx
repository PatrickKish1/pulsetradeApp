import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PULSE TRADE AI",
    description: "The OP trading ai platform",
    icons: '/next.svg'
  };



  export default function ChatPageLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    );
  }