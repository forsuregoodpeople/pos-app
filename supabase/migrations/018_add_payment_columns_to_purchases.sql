-- Add paid_amount and payment_method to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Update existing records to have paid_amount = 0 if null (though default handles new ones)
UPDATE purchases SET paid_amount = 0 WHERE paid_amount IS NULL;
