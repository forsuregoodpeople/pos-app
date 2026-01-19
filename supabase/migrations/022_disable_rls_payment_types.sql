-- Disable RLS on payment_types table
-- This is master data table that should be accessible to authenticated users
-- Similar to mechanic_performance and other master tables, this doesn't require user-level RLS

ALTER TABLE payment_types DISABLE ROW LEVEL SECURITY;
