-- Migration 003: Assign Role Permissions
-- Jalankan migration ini di Supabase SQL Editor setelah semua tabel bisnis dibuat

-- ============================================
-- Assign permissions to kasir role
-- ============================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'kasir' AND p.action IN ('read', 'create') AND p.resource IN ('barang', 'jasa', 'mekanik', 'transaksi', 'pos')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================
-- Assign permissions to mekanik role
-- ============================================

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'mekanik' AND p.action IN ('read') AND p.resource IN ('transaksi', 'mekanik')
ON CONFLICT (role_id, permission_id) DO NOTHING;