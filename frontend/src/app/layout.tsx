import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

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
    <html lang="en">
      <body className="text-slate-900 min-h-screen antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
