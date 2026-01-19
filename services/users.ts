'use server'

import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
}

export async function getUsersAction() {
    const supabase = await createClient();

    // Fetch from public.users table (which is synced with auth.users via trigger)
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Gagal mengambil data user: ${error.message}`);
    }

    return data as UserData[];
}

export async function createUserAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;

    if (!email || !password || !name) {
        return { success: false, error: 'Semua field harus diisi' };
    }

    // Use Admin Client (Service Role) to create user in Auth
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto confirm
        user_metadata: {
            name,
            role
        }
    });

    if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
    }

    // Note: Trigger in DB will handle insertion into public.users

    return { success: true };
}

export async function deleteUserAction(id: string) {
    // Use Admin Client to delete user from Auth
    // This should cascade delete from public.users if configured, or we delete manually
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
