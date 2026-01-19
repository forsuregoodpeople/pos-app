-- Migration: Secure Users and Enable strict RLS
-- Description: Locks down database access to authenticated users only and syncs auth.users to public.users

-- 1. Create a trigger to sync new users from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    new.id, -- Use UUID from auth.users
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email), -- Use name from metadata or fallback to email
    COALESCE(new.raw_user_meta_data->>'role', 'karyawan'), -- Default role
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Modify public.users table (Re-create for UUID support)
-- Old table had BIGINT id, which is incompatible with Supabase Auth UUID.
-- We drop and recreate it to ensure clean state.
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'karyawan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on all tables and set strict policies

-- Helper function to check role (optional, for future robust RBAC)
-- CREATE OR REPLACE FUNCTION public.get_user_role()
-- RETURNS text AS $$
--   SELECT role FROM public.users WHERE id = auth.uid();
-- $$ LANGUAGE sql STABLE;

-- --- USERS Table ---
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- --- GENERIC Tables (data_barang, data_jasa, etc.) ---
-- Revoke the "Allow All" policies created previously
DROP POLICY IF EXISTS "Enable all operations for data_barang" ON data_barang;
DROP POLICY IF EXISTS "Enable all operations for data_jasa" ON data_jasa; 
-- (Add drops for other tables if necessary)

-- Create "Authenticated Only" policies
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('users', 'schema_migrations') -- Exclude users (handled above)
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop old policies if any (simplistic approach, might error if policy names differ)
        -- BECAREFUL: This loop is illustrative. Better to be explicit for known tables.
    END LOOP;
END $$;

-- Explicit policies for key tables
-- DATA_BARANG
CREATE POLICY "Enable read for authenticated users only" ON data_barang FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for authenticated users only" ON data_barang FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON data_barang FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON data_barang FOR DELETE TO authenticated USING (true);

-- DATA_JASA
CREATE POLICY "Enable all for authenticated users" ON data_jasa FOR ALL TO authenticated USING (true);

-- DATA_MEKANIK
CREATE POLICY "Enable all for authenticated users" ON data_mekanik FOR ALL TO authenticated USING (true);

-- DATA_TRANSAKSI
CREATE POLICY "Enable all for authenticated users" ON data_transaksi FOR ALL TO authenticated USING (true);

-- Restore access for service_role (Admin clients)
-- Service role bypasses RLS automatically, so no need for explicit policies usually.

