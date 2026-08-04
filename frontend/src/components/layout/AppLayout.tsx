'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/' || pathname === '/signin';
  
  if (isAuthPage) {
    return <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">{children}</main>;
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 pt-16 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
};
