import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'de', 'ar'],

    // Used when no locale matches
    defaultLocale: 'de',
    localePrefix: 'as-needed'
});

export default function middleware(req: NextRequest) {
    const response = intlMiddleware(req);

    // Self-healing: If user has secure 'admin_session' but is missing the UI 'is_admin' cookie,
    // we restore it so the Logout button appears.
    const adminSession = req.cookies.get('admin_session');
    const isAdmin = req.cookies.get('is_admin');

    if (adminSession && !isAdmin) {
        response.cookies.set('is_admin', 'true', {
            httpOnly: false, // Ensure client-side JS can see it for UI logic
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
    }

    return response;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel` or `/admin`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
