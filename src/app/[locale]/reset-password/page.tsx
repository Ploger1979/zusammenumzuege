'use client';

import { useTranslations } from 'next-intl';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/app/actions/auth';
import { Lock, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

function ResetForm() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!token) {
        return (
            <div className="text-center text-red-600">
                Invalid or missing token.
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        // Add token manually since it's in URL, not form
        formData.append('token', token!);

        const result = await resetPassword(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setError(result.error || 'serverError');
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
                    <KeyRound size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Passwort geändert!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ihr Passwort wurde erfolgreich aktualisiert. Sie werden weitergeleitet...
                </p>
                <Link href="/login" className="text-primary font-bold hover:underline">
                    In 3 Sekunden zum Login...
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Neues Passwort
                </label>
                <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="••••••••"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passwort bestätigen
                </label>
                <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="••••••••"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                    {t(error as any) || error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow-lg"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Passwort speichern'}
            </button>
        </form>
    );

}

export default function ResetPasswordPage() {
    const t = useTranslations('Auth');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('forgotTitle')}</h1> {/* Reuse title or make new key */}
                </div>

                <Suspense fallback={<div className="text-center p-4"><Loader2 className="animate-spin mx-auto" /></div>}>
                    <ResetForm />
                </Suspense>

                <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <ArrowLeft size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
                        {t('backToLogin')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
