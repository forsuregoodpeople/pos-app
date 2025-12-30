-- Migration 016: Add Payment Type to Transactions
-- Add payment_type_id and payment_type_name to data_transaksi table

ALTER TABLE data_transaksi
ADD COLUMN IF NOT EXISTS payment_type_id UUID REFERENCES payment_types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_type_name VARCHAR(100) DEFAULT NULL;

-- Create index for payment_type_id
CREATE INDEX IF NOT EXISTS idx_data_transaksi_payment_type_id ON data_transaksi(payment_type_id);
