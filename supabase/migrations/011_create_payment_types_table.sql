-- Create payment_types table
CREATE TABLE IF NOT EXISTS payment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment types
INSERT INTO payment_types (name, description, is_default) VALUES
('Tunai', 'Pembayaran tunai/cash', true),
('Transfer Bank', 'Pembayaran melalui transfer bank', false),
('Kartu Debit', 'Pembayaran menggunakan kartu debit', false),
('Kartu Kredit', 'Pembayaran menggunakan kartu kredit', false),
('E-Wallet', 'Pembayaran menggunakan dompet digital', false),
('Cek', 'Pembayaran menggunakan cek', false),
('Giro', 'Pembayaran menggunakan giro', false),
('Tunai Bertahap', 'Pembayaran cicilan/tahapan', false),
('Konsinyasi', 'Pembelian dengan sistem konsinyasi', false)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_types_active ON payment_types(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_types_default ON payment_types(is_default);

-- Add comments
COMMENT ON TABLE payment_types IS 'Master data untuk jenis-jenis pembayaran yang tersedia di sistem';
COMMENT ON COLUMN payment_types.name IS 'Nama tipe pembayaran (unik)';
COMMENT ON COLUMN payment_types.description IS 'Deskripsi detail tipe pembayaran';
COMMENT ON COLUMN payment_types.is_active IS 'Status aktif/non-aktif tipe pembayaran';
COMMENT ON COLUMN payment_types.is_default IS 'Tipe pembelian default yang dipilih otomatis';