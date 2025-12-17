import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactQueryProvider } from '@/providers/react-query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { BrowserExtensionFix } from '@/components/BrowserExtensionFix';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PointageFlex - Gestion de Présence',
  description: 'Solution SaaS de gestion de présence et pointage multi-tenant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <BrowserExtensionFix />
        <ReactQueryProvider>
          <AuthProvider>
            <RouteGuard>{children}</RouteGuard>
          </AuthProvider>
        </ReactQueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
