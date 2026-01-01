import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Header, BottomNav } from '@/components/layout';
import { VideoBackground } from '@/components/ui';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: {
    default: 'Bilimdon - Bilim Platformasi',
    template: '%s | Bilimdon',
  },
  description: 'Test topshiring, bilimingizni sinang, reytingda raqobatlashing va AI yordamchisidan foydalaning',
  keywords: ['bilimdon', 'test', 'quiz', 'ta\'lim', 'bilim', 'o\'zbek', 'dasturlash', 'matematika'],
  authors: [{ name: 'Bilimdon Team' }],
  creator: 'Bilimdon',
  publisher: 'Bilimdon',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    url: 'https://bilimdon.uz',
    siteName: 'Bilimdon',
    title: 'Bilimdon - Bilim Platformasi',
    description: 'Test topshiring, bilimingizni sinang, reytingda raqobatlashing',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bilimdon - Bilim Platformasi',
    description: 'Test topshiring, bilimingizni sinang, reytingda raqobatlashing',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('bilimdon-app') && JSON.parse(localStorage.getItem('bilimdon-app')).state.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (!localStorage.getItem('bilimdon-app') && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        {/* Telegram WebApp Script */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className={inter.className}>
        <VideoBackground />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-20">
            {children}
          </main>
          <BottomNav />
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
