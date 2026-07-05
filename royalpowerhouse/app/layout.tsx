import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '@/app/components/Sidebar';
import { ToastProvider } from '@/app/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Academy — Student Management System',
    template: '%s — Academy SMS',
  },
  description:
    'Royal Powerhouse Academy SMS: a premium, high-performance student management system for modern educational institutions.',
  keywords: ['student management', 'academy', 'school administration', 'grades', 'attendance', 'finance'],
  authors: [{ name: 'Royal Powerhouse Academy' }],
  creator: 'Royal Powerhouse Academy',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Academy SMS',
    title: 'Academy — Student Management System',
    description: 'Premium, high-performance student management system for modern educational institutions.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable}`}>
      <head />
      <body className="bg-black text-white min-h-screen antialiased font-sans">
        <ToastProvider>
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
