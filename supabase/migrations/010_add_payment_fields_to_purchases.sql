-- Add payment tracking fields to purchases table
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_due_date ON purchases(due_date);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);

-- Add comments for documentation
COMMENT ON COLUMN purchases.paid_amount IS 'Total amount that has been paid for this purchase';
COMMENT ON COLUMN purchases.payment_method IS 'Payment method used (cash, transfer, check, etc.)';