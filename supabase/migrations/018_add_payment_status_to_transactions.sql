-- Migration 018: Add Payment Status to Transactions
-- Add payment_status and paid_amount to data_transaksi table

ALTER TABLE data_transaksi
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15, 2) DEFAULT 0;

-- Create index for payment_status
CREATE INDEX IF NOT EXISTS idx_data_transaksi_payment_status ON data_transaksi(payment_status);

-- Update existing records to have paid_amount = total (assuming all previous are paid)
UPDATE data_transaksi SET paid_amount = total WHERE payment_status = 'paid' AND paid_amount = 0;
