import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET() {
    const cookieStore = await cookies();
    const hasSession = cookieStore.has('admin_session');

    if (hasSession) {
        // If logged in, go to German invoice page by default
        return redirect('/de/invoice');
    } else {
        // If not logged in, go to German login page
        return redirect('/de/login');
    }
}
