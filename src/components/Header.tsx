'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations, useLocale } from 'next-intl';

import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

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
                    <a href="tel:+4917644465156" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                        <Phone size={14} className="text-secondary" /> 017644465156
                    </a>
                    <a href="mailto:info@zusammen-umzuege.de" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                        <Mail size={14} className="text-secondary" /> info@zusammen-umzuege.de
                    </a>
                </div>
            </div>

            <div className="container mx-auto px-4 py-3 flex justify-between items-center h-20">

                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-3 group">
                    <Image src="/logo-Circle.png" alt="Zusammen Umzüge" width={60} height={60} className="w-14 h-14 object-contain transition-transform group-hover:scale-105" />
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold text-primary-900 dark:text-white leading-none tracking-tight group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Zusammen</span>
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
                        <div className="flex justify-center gap-6 pt-2 text-gray-500 dark:text-gray-400">
                            <a href="tel:+4917644465156"><Phone size={20} /></a>
                            <a href="mailto:info@zusammen-umzuege.de"><Mail size={20} /></a>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
