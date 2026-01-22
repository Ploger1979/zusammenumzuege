import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    const t = useTranslations('Footer');
    const locale = useLocale();

    const getLocalizedPath = (path: string) => `/${locale}${path}`;

    return (
        <footer className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-primary-100 dark:border-gray-800 pt-16 pb-8 transition-all duration-300">
            <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                {/* Brand */}
                <div>
                    <Link href={`/${locale}`} className="flex items-center gap-3 mb-6 group">
                        <div className="relative w-14 h-14 flex-shrink-0">
                            <Image
                                src="/logo-Circle.png"
                                alt="Zusammen Umzüge Logo"
                                fill
                                className="object-contain transition-transform group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-2xl font-extrabold text-[#10b981] dark:text-[#34d399] leading-none tracking-tight group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">Zusammen</span>
                            <span className="text-2xl font-bold text-secondary leading-none tracking-wide">Umzüge</span>
                        </div>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                        {t('about')}
                    </p>
                    <div className="flex gap-6">
                        <a href="https://www.facebook.com/zusammen.umzuege" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                            <Facebook size={28} strokeWidth={1.5} />
                        </a>
                        <a href="https://www.instagram.com/zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                            <Instagram size={28} strokeWidth={1.5} />
                        </a>
                        <a href="https://www.tiktok.com/@zusammen_umzuege" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Services */}
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">{t('services')}</h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li><Link href={getLocalizedPath('/services')} className="hover:text-secondary transition-colors">{t('services')}</Link></li>
                    </ul>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">{t('legal')}</h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li><Link href={getLocalizedPath('/impressum')} className="hover:text-secondary transition-colors">{t('imprint')}</Link></li>
                        <li><Link href={getLocalizedPath('/datenschutz')} className="hover:text-secondary transition-colors">{t('privacy')}</Link></li>
                        <li><Link href={getLocalizedPath('/agb')} className="hover:text-secondary transition-colors">{t('terms')}</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-6">{t('contact')}</h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">{t('address')}:</span>
                            <span>Zehnthofstraße 55<br />55252 Mainz-Kastel</span>
                        </li>
                        <li className="flex gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">{t('phone')}:</span>
                            <a href="tel:+491782722300" className="hover:text-secondary transition-colors">01782722300</a>
                        </li>
                        <li className="flex gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-gray-900 dark:text-white font-medium">{t('email')}:</span>
                            <a href="mailto:info@zusammenumzuege.de" className="hover:text-secondary transition-colors">info@zusammenumzuege.de</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 pb-8">
                <p>&copy; {new Date().getFullYear()} Zusammen Umzüge. {t('rights')}</p>
            </div>
        </footer>
    );
}


