// Script untuk membuat superadmin user menggunakan anon key
// Jalankan dengan: npx tsx scripts/create-superadmin-simple.ts

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createSuperadmin() {
  try {
    console.log('Creating superadmin user...');

    // Sign up user dengan auto confirm
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'superadmin@gmail.com',
      password: 'superadmin_password123',
      options: {
        data: {
          name: 'Superadmin',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✓ Superadmin user already exists in Supabase Auth');
      } else {
        throw signUpError;
      }
    } else {
      console.log('✓ Superadmin user created in Supabase Auth');
    }

    // Sign in untuk mendapatkan session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'superadmin@gmail.com',
      password: 'superadmin_password123'
    });

    if (signInError) {
      throw signInError;
    }

    console.log('✓ Successfully signed in');

    // Insert ke custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        email: 'superadmin@gmail.com',
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
      .eq('email', 'superadmin@gmail.com')
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
    console.log('Email: superadmin@gmail.com');
    console.log('Password: superadmin_password123');

  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
}

createSuperadmin();