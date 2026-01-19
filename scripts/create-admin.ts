
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY; // This seems to be the service role key based on the name 'SECRET_KEY', though typically it's SUPABASE_SERVICE_ROLE_KEY. Let's try.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'superadmin@sunda-servis.com';
    const password = 'superadmin_password123';

    console.log(`Attempting to create user: ${email}`);

    // 1. Create user in Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            name: 'Superadmin',
            role: 'admin'
        }
    });

    if (userError) {
        console.error('Error creating user in Auth:', userError);
        // If user already exists, we might want to reset password, but based on previous check, they don't exist.
        if (userError.message.includes("already registered")) {
            console.log("User already exists, attempting to update password...");
            // We'd need the ID, but let's assume we can just sign in or similar. 
            // Actually, admin.updateUserById requires ID.
            // Let's just exit for now.
        }
        return;
    }

    console.log('User created in Auth successfully:', userData.user.id);

    // 2. The trigger in migration should handle public.users, but let's double check/ensure row in public.users
    // We can't easily check public.users via this client if RLS is strict and we are not using a client that bypasses it for table access (service role does bypass RLS).

    // Let's try to upsert into public.users just in case the trigger failed or didn't run.
    const { error: dbError } = await supabase
        .from('users')
        .upsert({
            id: userData.user.id,
            email: email,
            name: 'Superadmin',
            role: 'admin',
            is_active: true
        });

    if (dbError) {
        console.error('Error upserting to public.users:', dbError);
    } else {
        console.log('User synced to public.users successfully');
    }

    // 3. Assign admin role in user_roles if that table is used
    // Check if roles table exists and get admin role id
    const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

    if (!rolesData) {
        console.log("No 'roles' table or 'admin' role found. Skipping explicit role assignment.");
    } else {
        const { error: roleAssignError } = await supabase
            .from('user_roles')
            .upsert({
                user_id: userData.user.id,
                role_id: rolesData.id
            });
        if (roleAssignError) console.error("Error creating user_role:", roleAssignError);
        else console.log("Admin role assigned successfully.");
    }
}

createAdmin().catch(console.error);
