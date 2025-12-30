-- Enable RLS for purchase tables
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_return_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON purchases;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON purchase_items;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON purchase_returns;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON purchase_return_items;

-- Create comprehensive policies for purchases
CREATE POLICY "Enable all access for authenticated users" ON purchases
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create comprehensive policies for purchase_items
CREATE POLICY "Enable all access for authenticated users" ON purchase_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create comprehensive policies for purchase_returns
CREATE POLICY "Enable all access for authenticated users" ON purchase_returns
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create comprehensive policies for purchase_return_items
CREATE POLICY "Enable all access for authenticated users" ON purchase_return_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant access to sequences if needed (optional but good for safety)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
