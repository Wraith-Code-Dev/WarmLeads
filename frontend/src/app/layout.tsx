import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'WarmLeads AI — Free Tier Cold Outreach Architecture',
  description: 'AI-Powered Cold Outreach System using Neon DB SQL Queue and Gmail OAuth API.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-900 text-gray-100 min-h-screen antialiased">
        <AuthProvider>
          <Sidebar />
          <Header />
          <main className="ml-64 pt-16 p-8 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
