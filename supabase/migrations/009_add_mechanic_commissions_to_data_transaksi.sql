-- Migration 009: Add mechanic_commissions column to data_transaksi table
-- Jalankan migration ini di Supabase SQL Editor

-- ============================================
-- Add mechanic_commissions column to data_transaksi
-- ============================================

ALTER TABLE data_transaksi ADD COLUMN IF NOT EXISTS mechanic_commissions JSONB DEFAULT NULL;

-- ============================================
-- Update permissions for new column
-- ============================================

-- No additional permissions needed as JSONB column inherits table permissions