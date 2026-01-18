import { Mail, Phone, MapPin } from 'lucide-react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
    title: 'Kontakt | Zusammen Umzüge',
    description: 'Kontaktieren Sie uns. Wir sind für Sie da.',
};

export default function KontaktPage() {
    const t = useTranslations('ContactPage');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">{t('title')}</h1>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Info */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('subtitle')}</h2>
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('phone')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{t('phoneDesc')}</p>
                                    <a href="tel:+4917644465156" className="text-xl font-bold text-secondary hover:text-secondary-hover block mb-3">017644465156</a>
                                    <a href="https://wa.me/4917644465156" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20bd5a] transition text-sm font-bold shadow-sm">
                                        <span>{t('whatsapp')}</span>
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('email')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-2">{t('emailDesc')}</p>
                                    <a href="mailto:info@zusammen-umzuege.de" className="text-lg font-bold text-secondary hover:text-secondary-hover">info@zusammen-umzuege.de</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{t('location')}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Musterstraße 123<br />12345 Musterstadt</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Form */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{t('sendMsg')}</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('firstName')}</label>
                                    <input className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('lastName')}</label>
                                    <input className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneLabel')}</label>
                                <input className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('msgLabel')}</label>
                                <textarea className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white h-32"></textarea>
                            </div>
                            <button type="button" className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-3 rounded-lg transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                {t('submit')}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
