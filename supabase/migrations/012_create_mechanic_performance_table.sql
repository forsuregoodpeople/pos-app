-- Create mechanic_performance table
CREATE TABLE IF NOT EXISTS mechanic_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mechanic_id BIGINT REFERENCES data_mekanik(id) ON DELETE CASCADE,
    transaction_id BIGINT REFERENCES data_transaksi(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- 'service' or 'part'
    service_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    commission_amount DECIMAL(12,2) DEFAULT 0,
    performance_score INTEGER DEFAULT 100, -- 1-100 score
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mechanic_performance_mechanic_id ON mechanic_performance(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_mechanic_performance_transaction_date ON mechanic_performance(transaction_date);
CREATE INDEX IF NOT EXISTS idx_mechanic_performance_service_type ON mechanic_performance(service_type);
CREATE INDEX IF NOT EXISTS idx_mechanic_performance_performance_score ON mechanic_performance(performance_score);

-- Add comments for documentation
COMMENT ON TABLE mechanic_performance IS 'Performance tracking untuk mekanik berdasarkan transaksi yang dikerjakan';
COMMENT ON COLUMN mechanic_performance.mechanic_id IS 'ID mekanik yang mengerjakan transaksi';
COMMENT ON COLUMN mechanic_performance.transaction_id IS 'ID transaksi yang terkait';
COMMENT ON COLUMN mechanic_performance.transaction_date IS 'Tanggal transaksi dilaksanakan';
COMMENT ON COLUMN mechanic_performance.service_type IS 'Jenis layanan (service/part)';
COMMENT ON COLUMN mechanic_performance.service_name IS 'Nama layanan atau barang';
COMMENT ON COLUMN mechanic_performance.quantity IS 'Jumlah unit yang dikerjakan';
COMMENT ON COLUMN mechanic_performance.unit_price IS 'Harga per unit';
COMMENT ON COLUMN mechanic_performance.total_price IS 'Total harga transaksi';
COMMENT ON COLUMN mechanic_performance.commission_rate IS 'Persentase komisi untuk mekanik';
COMMENT ON COLUMN mechanic_performance.commission_amount IS 'Jumlah komisi yang diterima';
COMMENT ON COLUMN mechanic_performance.performance_score IS 'Skor performa (1-100)';
COMMENT ON COLUMN mechanic_performance.notes IS 'Catatan tambahan tentang performa';

-- Create a view for mechanic performance summary
CREATE OR REPLACE VIEW mechanic_performance_summary AS
SELECT
    dm.id as mechanic_id,
    dm.name as mechanic_name,
    COUNT(mp.id) as total_transactions,
    COALESCE(SUM(mp.total_price), 0) as total_revenue,
    COALESCE(SUM(mp.commission_amount), 0) as total_commission,
    COALESCE(AVG(mp.performance_score), 0) as avg_performance_score,
    COALESCE(MAX(mp.transaction_date), CURRENT_DATE) as last_transaction_date,
    CASE
        WHEN MAX(mp.transaction_date) >= CURRENT_DATE - INTERVAL '7 days' THEN 'Active'
        WHEN MAX(mp.transaction_date) >= CURRENT_DATE - INTERVAL '30 days' THEN 'Recent'
        ELSE 'Inactive'
    END as activity_status
FROM data_mekanik dm
LEFT JOIN mechanic_performance mp ON dm.id = mp.mechanic_id
GROUP BY dm.id, dm.name;