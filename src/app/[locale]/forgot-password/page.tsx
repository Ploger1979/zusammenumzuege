'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
    const t = useTranslations('Auth');
    const locale = useLocale();
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        await requestPasswordReset(formData);

        // Always show success to prevent email enumeration (Security best practice)
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden p-8">

                {!sent ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 mb-4">
                                <Mail size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('forgotTitle')}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('forgotDesc')}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg flex justify-center items-center"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : t('sendLink')}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('linkSent')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {t('linkSent')}
                        </p>
                        <Link href={`/${locale}/login`} className="text-primary font-bold hover:underline">
                            {t('backToLogin')}
                        </Link>
                    </div>
                )}

                <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
                    <Link href={`/${locale}/login`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <ArrowLeft size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                        {t('backToLogin')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
