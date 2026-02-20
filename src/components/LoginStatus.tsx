'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import Cookies from 'js-cookie';

import { useLocale } from 'next-intl';

export function LoginStatus() {
    const locale = useLocale();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check for the cookie client-side
        // We can just check document.cookie string for 'admin_session' or use js-cookie
        // Using js-cookie is cleaner if installed, checking package.json... yes it is installed.
        // We can just check document.cookie string for 'is_admin' or use js-cookie
        const session = Cookies.get('is_admin');
        setIsLoggedIn(!!session);
    }, []);

    const handleLogout = async () => {
        await logout();
        Cookies.remove('is_admin'); // Remove the visible UI cookie
        setIsLoggedIn(false);
        router.refresh(); // Refresh to update UI
        router.push('/');
    };

    if (!isLoggedIn) return null;

    // User requested to hide these small links and put logout directly on the admin page
    return null;
}
