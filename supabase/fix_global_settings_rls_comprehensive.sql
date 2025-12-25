-- Comprehensive fix for global_settings RLS
-- Run this entire script in Supabase SQL Editor

-- Step 1: Disable RLS temporarily
ALTER TABLE global_settings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Admin users can modify global settings" ON global_settings;
DROP POLICY IF EXISTS "Authenticated users can view global settings" ON global_settings;
DROP POLICY IF EXISTS "Authenticated users can modify global settings" ON global_settings;

-- Step 3: Re-enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create permissive policies for all operations
-- Policy for SELECT
CREATE POLICY "Allow authenticated users to select global_settings" 
ON global_settings
FOR SELECT 
TO authenticated
USING (true);

-- Policy for INSERT
CREATE POLICY "Allow authenticated users to insert global_settings" 
ON global_settings
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE
CREATE POLICY "Allow authenticated users to update global_settings" 
ON global_settings
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for DELETE
CREATE POLICY "Allow authenticated users to delete global_settings" 
ON global_settings
FOR DELETE 
TO authenticated
USING (true);
