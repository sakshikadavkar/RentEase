-- RentEase Phase 3 Admin Portal Schema Enhancements

-- 1. Add is_active column to users table for account activation/deactivation
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Ensure damage_claims has all necessary fields
ALTER TABLE damage_claims ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'assessed';
ALTER TABLE damage_claims ADD COLUMN IF NOT EXISTS resolution_notes TEXT;

-- 3. Additional Admin Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_units(status);
CREATE INDEX IF NOT EXISTS idx_inventory_city ON inventory_units(city);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tickets(status);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);
