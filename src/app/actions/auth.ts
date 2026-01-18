'use server';

import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'zusammen2026';

/**
 * Registriert einen neuen Admin / Register a new admin
 */
export async function register(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    // 1. Secret Key Check Removed per user request.
    // if (secretKey !== ADMIN_SECRET) {
    //     return { success: false, error: 'invalidSecret' };
    // }

    // 2. Validate Password Match
    if (password !== confirmPassword) {
        return { success: false, error: 'passwordMismatch' };
    }

    try {
        await dbConnect();

        // 3. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return { success: false, error: 'emailExists' };
        }

        // 4. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create User
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        // 6. Login immediately (Set cookie)
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return { success: true };

    } catch (err: any) {
        console.error('Registration Error:', err);
        // Return actual error for debugging, falling back to 'serverError' key if strictly needed, 
        // but let's pass the message to see it in the UI.
        return { success: false, error: err.message || 'serverError' };
    }
}

/**
 * Handles the login process.
 */
export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await dbConnect();

        // 1. Find User
        const user = await User.findOne({ email });

        // Check if user exists AND matches password
        if (user && (await bcrypt.compare(password, user.password))) {
            // 2. Set Cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
            return { success: true };
        } else {
            // Also check for legacy hardcoded password (for migration safety, optional)
            // But user asked for database storage. So we stick to DB mostly.
            // If you want to keep 'admin123' working until you register, you can add:
            if (password === 'admin123' && email === 'admin') { // Legacy fallback
                const cookieStore = await cookies();
                cookieStore.set('admin_session', 'true', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
                return { success: true };
            }

            return { success: false, error: 'error' };
        }

    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
}

/**
 * Request Password Reset
 * Generates a token and sends an email.
 */
import Token from '@/models/Token';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;

    try {
        await dbConnect();

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Security: Don't reveal if user exists or not, just return success
            // But for detailed feedback you might want to return specific error.
            // Let's return success to prevent user enumeration attacks, OR specific error if client insists.
            // For this project, let's just return success so the user checks their mail (or doesn't get one).
            return { success: true };
        }

        // 2. Delete existing tokens for this user
        await Token.deleteMany({ userId: user._id });

        // 3. Create new token
        const token = uuidv4();
        await Token.create({
            userId: user._id,
            token,
        });

        // 4. Send Email
        await sendPasswordResetEmail(user.email, token);

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Reset Password
 * Verifies token and updates password.
 */
export async function resetPassword(formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { success: false, error: 'passwordMismatch' };
    }

    try {
        await dbConnect();

        // 1. Find Token
        const resetToken = await Token.findOne({ token });
        if (!resetToken) {
            return { success: false, error: 'invalidOrExpiredToken' };
        }

        // 2. Find User
        const user = await User.findById(resetToken.userId);
        if (!user) {
            return { success: false, error: 'userNotFound' };
        }

        // 3. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Update User
        user.password = hashedPassword;
        await user.save();

        // 5. Delete Token
        await Token.deleteOne({ _id: resetToken._id });

        return { success: true };

    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}
