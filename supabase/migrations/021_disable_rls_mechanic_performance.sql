-- Disable RLS on mechanic_performance table
-- This table is for internal tracking and should be managed by the system, not subject to user-level RLS
ALTER TABLE mechanic_performance DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS and create permissive policies, use this instead:
-- 
-- -- Allow authenticated users to read their own mechanic's performance
-- CREATE POLICY "Allow read own mechanic performance" ON mechanic_performance
--     FOR SELECT
--     USING (true); -- Allow all authenticated users to read
-- 
-- -- Allow system/service to insert performance records
-- CREATE POLICY "Allow service to insert performance" ON mechanic_performance
--     FOR INSERT
--     WITH CHECK (true); -- Allow inserts from service role
