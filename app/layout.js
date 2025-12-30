import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Risk Management Application',
  description: 'AI-based web application for simplified risk management with guided workflows',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}