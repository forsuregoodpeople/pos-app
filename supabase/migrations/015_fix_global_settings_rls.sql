-- Migration 015: Fix Global Settings RLS Policy (Robust Version)
-- The previous policy tried to access auth.users which causes permission errors for normal users.
-- This migration resets all policies for global_settings to ensure access.

-- 1. Temporarily disable RLS to prevent issues during policy changes
ALTER TABLE global_settings DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies for this table to ensure a clean slate
DROP POLICY IF EXISTS "Admin users can modify global settings" ON global_settings;
DROP POLICY IF EXISTS "Authenticated users can view global settings" ON global_settings;
DROP POLICY IF EXISTS "Authenticated users can modify global settings" ON global_settings;

-- 3. Re-enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create new permissive policies for authenticated users
-- Allow viewing settings
CREATE POLICY "Authenticated users can view global settings" ON global_settings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow modifying settings (update/insert/delete)
CREATE POLICY "Authenticated users can modify global settings" ON global_settings
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
