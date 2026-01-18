import { useTranslations } from 'next-intl';
import QuoteFormShort from './QuoteFormShort';

export default function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 md:py-20 lg:py-24 overflow-hidden transition-colors duration-300">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-3xl z-0"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-white dark:bg-gray-800 border border-secondary-100 dark:border-gray-700 shadow-sm text-secondary font-bold text-sm tracking-wide">
                            <span className="text-lg">🤝</span> {t('trust')}
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-[1.15]">
                            {t('title')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                                {t('subtitle')}
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            {t('desc')}
                        </p>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="text-2xl">🚛</div>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">{t.rich('fastTransport', { br: () => <br /> })}</div>
                            </div>
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="text-2xl">🛡️</div>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">{t.rich('fullyInsured', { br: () => <br /> })}</div>
                            </div>
                            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="text-2xl">💶</div>
                                <div className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-tight">{t.rich('fairPrices', { br: () => <br /> })}</div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full max-w-md ml-auto mr-auto lg:mr-0">
                        <div className="transform hover:scale-[1.01] transition-transform duration-300">
                            <QuoteFormShort />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
