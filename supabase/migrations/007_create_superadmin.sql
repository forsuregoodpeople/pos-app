-- Migration untuk membuat superadmin user
-- Email: superadmin@sunda-servis.com
-- Password: superadmin_password123

-- Buat user di Supabase Auth menggunakan RPC function
-- Note: Ini harus dijalankan manual melalui Supabase Dashboard atau menggunakan Supabase CLI

-- Insert user ke tabel users kustom setelah user dibuat di Supabase Auth
INSERT INTO users (email, name, password_hash, is_active) VALUES
('superadmin@sunda-servis.com', 'Superadmin', 'superadmin_password123', true)
ON CONFLICT (email) DO NOTHING;

-- Assign admin role to superadmin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'superadmin@sunda-servis.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Catatan: Untuk membuat user di Supabase Auth, jalankan script berikut di Supabase SQL Editor:
/*
-- Buat user di Supabase Auth
SELECT auth.signup(
  email := 'superadmin@sunda-servis.com',
  password := 'superadmin_password123',
  email_confirm := true
);

-- Atau gunakan function ini untuk membuat user dengan role admin
CREATE OR REPLACE FUNCTION create_superadmin()
RETURNS void AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Buat user di auth.users
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, phone, phone_confirmed_at, phone_changed_at, email_change_token_new, recovery_token)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'superadmin@sunda-servis.com',
    crypt('superadmin_password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  )
  RETURNING id INTO user_id;
  
  -- Insert ke tabel users kustom
  INSERT INTO users (email, name, password_hash, is_active)
  VALUES ('superadmin@sunda-servis.com', 'Superadmin', 'superadmin_password123', true)
  ON CONFLICT (email) DO NOTHING;
  
  -- Assign admin role
  INSERT INTO user_roles (user_id, role_id)
  SELECT u.id, r.id
  FROM users u, roles r
  WHERE u.email = 'superadmin@sunda-servis.com' AND r.name = 'admin'
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Jalankan function
SELECT create_superadmin();
*/