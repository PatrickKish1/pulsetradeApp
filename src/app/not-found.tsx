"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
      src="/not-found.png"
      alt="Not Found"
      width={400}
      height={300}
      priority={true}
      />
      <h1 className="text-2xl font-bold mt-4">Page Not Found</h1>
      <p className="mt-2">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-4 text-blue-500 hover:underline">
        <Button className="rounded-full">Return to Home</Button>
      </Link>
    </div>
  );
}
