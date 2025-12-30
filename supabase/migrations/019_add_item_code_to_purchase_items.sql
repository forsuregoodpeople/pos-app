-- Add item_code to purchase_items
ALTER TABLE purchase_items 
ADD COLUMN IF NOT EXISTS item_code VARCHAR(255);

-- Add item_code to purchase_return_items
ALTER TABLE purchase_return_items 
ADD COLUMN IF NOT EXISTS item_code VARCHAR(255);

-- Create index for item_code
CREATE INDEX IF NOT EXISTS idx_purchase_items_item_code ON purchase_items(item_code);
CREATE INDEX IF NOT EXISTS idx_purchase_return_items_item_code ON purchase_return_items(item_code);
