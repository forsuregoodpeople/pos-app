// Script untuk membuat superadmin user di Supabase
// Jalankan dengan: npx tsx scripts/create-superadmin.ts

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Anda perlu menambahkan ini di .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('You can get this from your Supabase project settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperadmin() {
  try {
    console.log('Creating superadmin user...');

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'superadmin@sunda-servis.com',
      password: 'superadmin_password123',
      email_confirm: true,
      user_metadata: {
        name: 'Superadmin',
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('Superadmin user already exists in Supabase Auth');
      } else {
        throw authError;
      }
    } else {
      console.log('✓ Superadmin user created in Supabase Auth');
    }

    // Get the user ID from auth
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const superadminUser = users.find(u => u.email === 'superadmin@sunda-servis.com');
    
    if (!superadminUser) {
      throw new Error('Failed to retrieve superadmin user ID');
    }

    // Insert into custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        email: 'superadmin@sunda-servis.com',
        name: 'Superadmin',
        password_hash: 'superadmin_password123',
        is_active: true
      })
      .select();

    if (userError) {
      throw userError;
    }

    console.log('✓ Superadmin user created/updated in custom users table');

    // Get admin role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      throw roleError;
    }

    // Get user ID from custom users table
    const { data: customUserData } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'superadmin@sunda-servis.com')
      .single();

    if (!customUserData) {
      throw new Error('Failed to retrieve custom user ID');
    }

    // Assign admin role to user
    const { error: assignmentError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: customUserData.id,
        role_id: roleData.id
      });

    if (assignmentError) {
      throw assignmentError;
    }

    console.log('✓ Admin role assigned to superadmin user');
    console.log('\n🎉 Superadmin setup completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: superadmin@sunda-servis.com');
    console.log('Password: superadmin_password123');

  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
}

createSuperadmin();