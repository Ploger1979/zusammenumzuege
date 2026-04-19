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
        const role = email === 'aymanploger@gmail.com' ? 'superadmin' : 'admin';
        await User.create({
            name,
            email,
            password: hashedPassword,
            role: role
        });

        // 6. Login immediately (Set cookie)
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // VISIBLE cookie for UI state (so the header knows we are logged in)
        cookieStore.set('is_admin', 'true', {
            httpOnly: false, // Accessible to client JS
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7,
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
        
        // AUTO-UPGRADE YOUR ACCOUNT
        if (user && user.email === 'aymanploger@gmail.com' && user.role !== 'superadmin') {
            user.role = 'superadmin';
            await user.save();
        }

        // Check if user exists AND matches password
        const isMatch = user && (await bcrypt.compare(password, user.password));

        if (isMatch) {
            // 2. Set Cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
            // VISIBLE cookie for UI state
            cookieStore.set('is_admin', 'true', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });
            // Role cookie (for UI optimization, actual check is on server)
            cookieStore.set('admin_role', user.role || 'admin', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });
            // Store email in a secure cookie to fetch user on server sessions
            cookieStore.set('admin_email', user.email, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });

            return { success: true };
        } else if (user && email === 'aymanploger@gmail.com' && password === 'admin123') {
            // AUTO-FIX: Force reset password for this specific user if they try to login with 'admin123'
            // This solves the "I can't login but I can't register" loop.
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            await user.save();

            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
            // VISIBLE cookie for UI state
            cookieStore.set('is_admin', 'true', {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });
            return { success: true };
        } else {
            // Also check for legacy hardcoded password (for migration safety, optional)
            if (password === 'admin123' && email === 'admin') { // Legacy fallback
                const cookieStore = await cookies();
                cookieStore.set('admin_session', 'true', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 60 * 60 * 24,
                    path: '/',
                });
                cookieStore.set('is_admin', 'true', {
                    httpOnly: false,
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
    cookieStore.delete('is_admin');
    cookieStore.delete('admin_role');
    cookieStore.delete('admin_email');
}

/**
 * Gets the current logged-in user role server-side
 */
export async function getAdminSession() {
    const cookieStore = await cookies();
    const email = cookieStore.get('admin_email')?.value;
    
    if (!email) return null;

    try {
        await dbConnect();
        const user = await User.findOne({ email });
        if (!user) return null;

        return {
            name: user.name,
            email: user.email,
            role: user.role || 'admin'
        };
    } catch (err) {
        return null;
    }
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

/**
 * Fetch all admin users (for the admin dashboard)
 */
export async function getUsers() {
    try {
        await dbConnect();
        // Return simple JSON objects
        const users = await User.find({}).sort({ createdAt: -1 });
        return {
            success: true,
            users: users.map(u => ({
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                createdAt: u.createdAt,
                role: u.role
            }))
        };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Delete a user by ID
 */
export async function deleteUser(userId: string) {
    try {
        await dbConnect();

        // Prevent deleting the last admin if you want strict safety, 
        // but for now let's just allow it (or check if it's self-deletion).

        await User.findByIdAndDelete(userId);
        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: 'serverError' };
    }
}

/**
 * Create a new admin user (without logging in)
 */
export async function createAdminUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Minimum validation
    if (!password || password.length < 6) {
        return { success: false, error: 'passwordTooShort' };
    }

    try {
        await dbConnect();

        const userExists = await User.findOne({ email });
        if (userExists) {
            return { success: false, error: 'emailExists' };
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        return { success: true };

    } catch (err: any) {
        console.error('Create Admin Error:', err);
        return { success: false, error: err.message || 'serverError' };
    }
}
