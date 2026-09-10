-- RentEase Complete PostgreSQL Relational Schema
-- Supports multi-role authentication, product catalog, subscriptions, logistics, and maintenance.

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'technician', 'logistics');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rental_status AS ENUM ('active', 'extended', 'completed', 'cancelled', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE unit_status AS ENUM ('available', 'rented', 'in_maintenance', 'in_transit', 'retired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE return_status AS ENUM ('requested', 'pickup_scheduled', 'inspected', 'completed', 'claim_pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'customer',
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS TABLE (Preserving exact 903 product string IDs and fields)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    description TEXT,
    monthly_price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    deposit NUMERIC(10, 2) DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    city VARCHAR(100),
    badge VARCHAR(50),
    badge_variant VARCHAR(50),
    delivery_days VARCHAR(50) DEFAULT '3–5 days',
    condition VARCHAR(50) DEFAULT 'Like new',
    warranty VARCHAR(50) DEFAULT '6 months',
    rental_durations JSONB DEFAULT '[1, 3, 6, 12]',
    features JSONB DEFAULT '[]',
    included_items JSONB DEFAULT '[]',
    specifications JSONB DEFAULT '{}',
    image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SERVICE AREAS
CREATE TABLE IF NOT EXISTS service_areas (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(100) UNIQUE NOT NULL,
    state_name VARCHAR(100),
    pincodes JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. INVENTORY UNITS
CREATE TABLE IF NOT EXISTS inventory_units (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    warehouse_location VARCHAR(255),
    status unit_status DEFAULT 'available',
    condition_grade VARCHAR(50) DEFAULT 'Grade A',
    last_inspected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    street_address TEXT NOT NULL,
    landmark VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    pincode VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    delivery_address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    status order_status DEFAULT 'confirmed',
    subtotal_monthly NUMERIC(10, 2) NOT NULL,
    deposit_total NUMERIC(10, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount_due NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    delivery_slot VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER DEFAULT 1,
    tenure_months INTEGER NOT NULL,
    monthly_price NUMERIC(10, 2) NOT NULL,
    deposit_amount NUMERIC(10, 2) DEFAULT 0
);

-- 9. RENTALS (Active & Past Subscriptions)
CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    rental_number VARCHAR(100) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(100) REFERENCES products(id) ON DELETE RESTRICT,
    inventory_unit_id INTEGER REFERENCES inventory_units(id) ON DELETE SET NULL,
    tenure_months INTEGER NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    deposit_paid NUMERIC(10, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_billing_date DATE,
    status rental_status DEFAULT 'active',
    delivery_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. RENTAL EXTENSIONS
CREATE TABLE IF NOT EXISTS rental_extensions (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    previous_end_date DATE NOT NULL,
    new_end_date DATE NOT NULL,
    additional_months INTEGER NOT NULL,
    adjusted_monthly_rent NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100) UNIQUE NOT NULL,
    scheduled_date DATE,
    time_slot VARCHAR(100),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'scheduled',
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. MAINTENANCE TICKETS
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    issue_category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'medium',
    status maintenance_status DEFAULT 'open',
    technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. RETURNS
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    return_number VARCHAR(100) UNIQUE NOT NULL,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pickup_date DATE NOT NULL,
    pickup_slot VARCHAR(100),
    status return_status DEFAULT 'requested',
    inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    inspection_passed BOOLEAN,
    deposit_refund_amount NUMERIC(10, 2) DEFAULT 0,
    deposit_refund_status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. DAMAGE CLAIMS
CREATE TABLE IF NOT EXISTS damage_claims (
    id SERIAL PRIMARY KEY,
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    return_id INTEGER REFERENCES returns(id) ON DELETE CASCADE,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    damage_description TEXT NOT NULL,
    photo_urls JSONB DEFAULT '[]',
    assessed_repair_cost NUMERIC(10, 2) NOT NULL,
    deposit_deduction_amount NUMERIC(10, 2) NOT NULL,
    customer_dispute_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'rent',
    payment_method VARCHAR(50) NOT NULL,
    status payment_status DEFAULT 'completed',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES for Query Optimization
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city);
CREATE INDEX IF NOT EXISTS idx_products_monthly_price ON products(monthly_price);
CREATE INDEX IF NOT EXISTS idx_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory_units(product_id);
