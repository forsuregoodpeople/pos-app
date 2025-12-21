-- Script untuk membuat superadmin user
-- Jalankan manual di Supabase SQL Editor

-- 1. Buat user di Supabase Auth
-- Note: Ini harus dilakukan manual melalui Authentication > Users di Supabase Dashboard
-- Email: superadmin@sunda-servis.com
-- Password: superadmin_password123

-- 2. Setelah user dibuat di Auth, jalankan SQL berikut:

-- Insert user ke tabel users kustom
INSERT INTO users (email, name, password_hash, is_active) VALUES
('superadmin@sunda-servis.com', 'Superadmin', 'superadmin_password123', true)
ON CONFLICT (email) DO NOTHING;

-- Assign admin role ke superadmin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.email = 'superadmin@sunda-servis.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Verifikasi user dibuat
SELECT 
    u.email,
    u.name,
    u.is_active,
    r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'superadmin@sunda-servis.com';