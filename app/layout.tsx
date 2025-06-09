
import React from 'react';
import { Metadata } from 'next';

import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Ecom',
  description: 'Best E-commerce platform',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}



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
