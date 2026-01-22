'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, Facebook, Instagram } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations, useLocale } from 'next-intl';

import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LoginStatus } from './LoginStatus';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const t = useTranslations('Header');
    const locale = useLocale();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const navLinks = [
        { name: t('home'), href: '' },
        { name: t('services'), href: 'services' },
        { name: t('quote'), href: 'angebot' },
        { name: t('contact'), href: 'kontakt' },
    ];

    const getLocalizedPath = (path: string) => {
        return path ? `/${locale}/${path}` : `/${locale}`;
    };

    const isActive = (path: string) => pathname === getLocalizedPath(path) || (path === '' && pathname === `/${locale}`);

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-primary-100 dark:border-gray-800 transition-all duration-300">

            {/* Top Bar (Contact Info) */}
            <div className="bg-primary-50 border-b border-primary-100 hidden md:block dark:bg-gray-900 dark:border-gray-800">
                <div className="container mx-auto px-4 py-1.5 flex justify-end items-center gap-6 text-xs font-medium text-primary-800 dark:text-gray-300">
                    {/* Admin Links (Client-side check) */}
                    <div className="flex gap-4 mr-auto">
                        <LoginStatus />
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                            <Facebook size={16} />
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                            <Instagram size={16} />
                        </a>
                        <a href="https://www.tiktok.com/@zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-3 flex justify-between items-center h-20">

                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-3 group">
                    <Image src="/logo-Circle.png" alt="Zusammen Umzüge" width={60} height={60} className="w-14 h-14 object-contain transition-transform group-hover:scale-105" />
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold text-[#10b981] dark:text-[#34d399] leading-none tracking-tight group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Zusammen</span>
                        <span className="text-xl font-bold text-secondary leading-none tracking-wide">Umzüge</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <nav className="flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={getLocalizedPath(link.href)}
                                className={clsx(
                                    "text-sm font-semibold transition-all duration-200 relative py-1",
                                    isActive(link.href) ? "text-secondary" : "text-gray-600 dark:text-gray-300 hover:text-secondary dark:hover:text-secondary"
                                )}
                            >
                                {link.name}
                                {isActive(link.href) && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <LanguageSwitcher />

                        <Link
                            href={getLocalizedPath('angebot')}
                            className="group bg-secondary hover:bg-secondary-hover text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 transform flex items-center gap-2 text-sm"
                        >
                            <span>{t('requestQuote')}</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                        </Link>
                    </div>
                </div>

                {/* Mobile menu trigger */}
                <div className="flex items-center gap-3 md:hidden">
                    <ThemeToggle />
                    <LanguageSwitcher />
                    <button className="text-primary-800 dark:text-gray-200 p-2 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute w-full shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
                    <nav className="flex flex-col p-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={getLocalizedPath(link.href)}
                                className={clsx(
                                    "p-3 text-lg font-medium rounded-xl transition-colors flex justify-between items-center",
                                    isActive(link.href) ? "bg-primary-50 dark:bg-gray-800 text-secondary" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                                {isActive(link.href) && <ArrowRight size={18} className="rtl:rotate-180" />}
                            </Link>
                        ))}
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                        <Link href={getLocalizedPath('angebot')} onClick={() => setIsMenuOpen(false)} className="bg-secondary text-white p-3 rounded-xl font-bold text-center shadow-sm block">
                            {t('freeOffer')}
                        </Link>
                        <div className="flex justify-center gap-6 pt-4 pb-2">
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                                <Facebook size={28} strokeWidth={1.5} />
                            </a>
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                                <Instagram size={28} strokeWidth={1.5} />
                            </a>
                            <a href="https://www.tiktok.com/@zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                                </svg>
                            </a>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
