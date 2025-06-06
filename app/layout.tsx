'use client';
import React from 'react';

import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Navbar from '@/components/Navbar';



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`antialiased`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Navbar/>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
