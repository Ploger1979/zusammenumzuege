import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://zusammenumzuege.de'),
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'Zusammen Umzüge',
      images: [
        {
          url: '/logo-new-transparent.png?v=3',
          width: 800,
          height: 800,
          alt: 'Zusammen Umzüge Logo',
        },
      ],
      locale: locale,
      type: 'website',
    },
      twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/logo-new-transparent.png?v=3'],
    },
    verification: {
      google: '2IhAGtUCnfAXY5Wg_9tDrCqUw7TbpeUSHnD8Pd4lr0M',
    },
    icons: {
      icon: '/favicon-circle.png',
      apple: '/Final-Logo-Mit-Webseite.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      title: 'Zusammen',
      statusBarStyle: 'black-translucent',
    },
  };
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid - ONLY DE ALLOWED NOW
  if (locale !== 'de') {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang="de" dir="ltr" suppressHydrationWarning>
      <body
        className={`
            ${geistSans.variable} ${geistMono.variable}
            antialiased transition-colors duration-300
            font-sans
            bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100
        `}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
              <Chatbot />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
