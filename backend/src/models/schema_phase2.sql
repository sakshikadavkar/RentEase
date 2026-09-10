-- RentEase Phase 2 Customer Rental Lifecycle Schema Enhancements

-- 1. Extend rental_status enum if needed
DO $$ BEGIN
    ALTER TYPE rental_status ADD VALUE IF NOT EXISTS 'return_requested';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE rental_status ADD VALUE IF NOT EXISTS 'terminated';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance returns table
ALTER TABLE returns ADD COLUMN IF NOT EXISTS return_reason TEXT;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS is_early_termination BOOLEAN DEFAULT FALSE;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS early_termination_fee NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS damage_deduction NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS final_refund_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE returns ADD COLUMN IF NOT EXISTS inspection_notes TEXT;

-- 3. Enhance maintenance_tickets table
ALTER TABLE maintenance_tickets ADD COLUMN IF NOT EXISTS preferred_time_slot VARCHAR(100);
ALTER TABLE maintenance_tickets ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE maintenance_tickets ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- 4. Enhance orders and rentals for direct linking & lifecycle tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_slot VARCHAR(100);
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'delivered';

-- 5. Additional Indexing for rapid customer lookups
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_rental_id ON returns(rental_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_rental_id ON maintenance_tickets(rental_id);
CREATE INDEX IF NOT EXISTS idx_extensions_rental_id ON rental_extensions(rental_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
