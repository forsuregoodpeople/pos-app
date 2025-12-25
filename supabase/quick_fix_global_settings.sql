-- Quick fix for global_settings RLS policy
-- Run this in Supabase SQL Editor

-- Drop the existing policy that's missing WITH CHECK
DROP POLICY IF EXISTS "Authenticated users can modify global settings" ON global_settings;

-- Recreate with both USING and WITH CHECK clauses
CREATE POLICY "Authenticated users can modify global settings" ON global_settings
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
