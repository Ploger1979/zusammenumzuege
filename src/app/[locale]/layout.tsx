import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono, Cairo } from "next/font/google"; // Added Cairo for Arabic
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from 'next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    metadataBase: new URL('https://zusammenumzuege.netlify.app'),
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/favicon-circle.png?v=2',
      shortcut: '/favicon-circle.png?v=2',
      apple: '/favicon-circle.png?v=2',
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'Zusammen Umzüge',
      images: [
        {
          url: '/logo-og-white.png?v=2',
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
      images: ['/logo-og-white.png?v=2'],
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'de', 'ar'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale;
  const isArabic = locale === 'ar';

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body
        className={`
            ${geistSans.variable} ${geistMono.variable} ${cairo.variable} 
            antialiased transition-colors duration-300
            ${isArabic ? 'font-cairo' : 'font-sans'}
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
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
