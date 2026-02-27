-- Godam Solutions Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── User Profiles table (extends Supabase auth.users) ───────────────────────
-- This table stores app-level profile data (name, role, etc.) and is keyed
-- to auth.users so Supabase Auth manages the credentials.
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'manager'
        CHECK (role IN ('owner', 'manager', 'qc_rep')),
    warehouse_id UUID,          -- FK added after warehouses table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger: auto-create a profile row whenever a new auth user is created.
-- SECURITY DEFINER means it runs as the DB owner (bypasses RLS), so this works
-- even when email confirmation is required and the client has no session yet.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'manager')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'manager', 'qc-rep')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches table (Inventory)
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id VARCHAR(50) UNIQUE NOT NULL,
    farmer_id VARCHAR(50) NOT NULL,
    farmer_name VARCHAR(255),
    farmer_contact VARCHAR(50),
    crop VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shelf_life INTEGER NOT NULL, -- in days
    risk_score NUMERIC(5, 2) DEFAULT 0,
    zone VARCHAR(50) NOT NULL,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'dispatched', 'expired')),
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    destination TEXT,
    dispatch_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    zone VARCHAR(50) NOT NULL,
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    ethylene NUMERIC(10, 2), -- ppm
    co2 NUMERIC(10, 2), -- ppm
    ammonia NUMERIC(10, 2), -- ppm
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allocation requests table
CREATE TABLE IF NOT EXISTS allocation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(50) UNIQUE NOT NULL,
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    variety VARCHAR(100),
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    deadline TIMESTAMP WITH TIME ZONE,
    location TEXT NOT NULL,
    price NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'allocated', 'dispatched', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table (Farmers and Buyers)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('farmer', 'buyer', 'both')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    location TEXT,
    crops TEXT[], -- Array of crops
    price_history JSONB, -- Store price history as JSON
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispatches table
CREATE TABLE IF NOT EXISTS dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dispatch_id VARCHAR(50) UNIQUE NOT NULL,
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    allocation_id UUID REFERENCES allocation_requests(id) ON DELETE SET NULL,
    destination TEXT NOT NULL,
    dispatch_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    status VARCHAR(50) DEFAULT 'in-transit' CHECK (status IN ('pending', 'in-transit', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor thresholds table (for alert configuration)
CREATE TABLE IF NOT EXISTS sensor_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    zone VARCHAR(50),
    temperature_min NUMERIC(5, 2),
    temperature_max NUMERIC(5, 2),
    humidity_min NUMERIC(5, 2),
    humidity_max NUMERIC(5, 2),
    ethylene_max NUMERIC(10, 2),
    co2_max NUMERIC(10, 2),
    ammonia_max NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(warehouse_id, zone)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    zone VARCHAR(50),
    type VARCHAR(50) NOT NULL CHECK (type IN ('temperature', 'humidity', 'gas', 'risk', 'system')),
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_batches_warehouse ON batches(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_risk_score ON batches(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_warehouse ON sensor_readings(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_allocation_requests_status ON allocation_requests(status);
CREATE INDEX IF NOT EXISTS idx_dispatches_batch ON dispatches(batch_id);
CREATE INDEX IF NOT EXISTS idx_alerts_warehouse ON alerts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(is_acknowledged);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses;
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_batches_updated_at ON batches;
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_allocation_requests_updated_at ON allocation_requests;
CREATE TRIGGER update_allocation_requests_updated_at BEFORE UPDATE ON allocation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dispatches_updated_at ON dispatches;
CREATE TRIGGER update_dispatches_updated_at BEFORE UPDATE ON dispatches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sensor_thresholds_updated_at ON sensor_thresholds;
CREATE TRIGGER update_sensor_thresholds_updated_at BEFORE UPDATE ON sensor_thresholds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK from user_profiles.warehouse_id → warehouses (warehouses now exists)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_profiles_warehouse'
          AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT fk_user_profiles_warehouse
            FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Basic - to be refined based on requirements)
-- Note: USING clause = what rows can be seen/modified
--       WITH CHECK clause = what rows can be inserted/updated

-- user_profiles: each user can manage only their own row.
DROP POLICY IF EXISTS "Users can view own user_profile" ON user_profiles;
CREATE POLICY "Users can view own user_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own user_profile" ON user_profiles;
CREATE POLICY "Users can insert own user_profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user_profile" ON user_profiles;
CREATE POLICY "Users can update own user_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users: Users can read and update their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Anyone can insert users during registration" ON users;
CREATE POLICY "Anyone can insert users during registration" ON users
    FOR INSERT WITH CHECK (true);

-- Warehouses: Allow authenticated users to view warehouses
DROP POLICY IF EXISTS "Authenticated users can view warehouses" ON warehouses;
CREATE POLICY "Authenticated users can view warehouses" ON warehouses
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can insert warehouses" ON warehouses;
CREATE POLICY "Owners can insert warehouses" ON warehouses
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can update their warehouses" ON warehouses;
CREATE POLICY "Owners can update their warehouses" ON warehouses
    FOR UPDATE TO authenticated USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owners can delete their warehouses" ON warehouses;
CREATE POLICY "Owners can delete their warehouses" ON warehouses
    FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- Batches: Allow authenticated users to view and manage batches
DROP POLICY IF EXISTS "Authenticated users can view batches" ON batches;
CREATE POLICY "Authenticated users can view batches" ON batches
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Managers can insert batches" ON batches;
CREATE POLICY "Managers can insert batches" ON batches
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can update batches" ON batches;
CREATE POLICY "Managers can update batches" ON batches
    FOR UPDATE TO authenticated USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can delete batches" ON batches;
CREATE POLICY "Managers can delete batches" ON batches
    FOR DELETE TO authenticated USING (true);

-- Sensor readings: Allow authenticated users to view and insert
DROP POLICY IF EXISTS "Authenticated users can view sensor readings" ON sensor_readings;
CREATE POLICY "Authenticated users can view sensor readings" ON sensor_readings
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "System can insert sensor readings" ON sensor_readings;
CREATE POLICY "System can insert sensor readings" ON sensor_readings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allocation requests: Allow authenticated users to view and manage
DROP POLICY IF EXISTS "Authenticated users can view allocation requests" ON allocation_requests;
CREATE POLICY "Authenticated users can view allocation requests" ON allocation_requests
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert allocation requests" ON allocation_requests;
CREATE POLICY "Users can insert allocation requests" ON allocation_requests
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own allocation requests" ON allocation_requests;
CREATE POLICY "Users can update their own allocation requests" ON allocation_requests
    FOR UPDATE TO authenticated USING (requester_id = auth.uid())
    WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own allocation requests" ON allocation_requests;
CREATE POLICY "Users can delete their own allocation requests" ON allocation_requests
    FOR DELETE TO authenticated USING (requester_id = auth.uid());

-- Contacts: Allow authenticated users full access
DROP POLICY IF EXISTS "Authenticated users can view contacts" ON contacts;
CREATE POLICY "Authenticated users can view contacts" ON contacts
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
CREATE POLICY "Authenticated users can insert contacts" ON contacts
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update contacts" ON contacts;
CREATE POLICY "Authenticated users can update contacts" ON contacts
    FOR UPDATE TO authenticated USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;
CREATE POLICY "Authenticated users can delete contacts" ON contacts
    FOR DELETE TO authenticated USING (true);

-- Dispatches: Allow authenticated users to view and manage
DROP POLICY IF EXISTS "Authenticated users can view dispatches" ON dispatches;
CREATE POLICY "Authenticated users can view dispatches" ON dispatches
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Managers can insert dispatches" ON dispatches;
CREATE POLICY "Managers can insert dispatches" ON dispatches
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can update dispatches" ON dispatches;
CREATE POLICY "Managers can update dispatches" ON dispatches
    FOR UPDATE TO authenticated USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can delete dispatches" ON dispatches;
CREATE POLICY "Managers can delete dispatches" ON dispatches
    FOR DELETE TO authenticated USING (true);

-- Sensor thresholds: Allow authenticated users to view and manage
DROP POLICY IF EXISTS "Authenticated users can view thresholds" ON sensor_thresholds;
CREATE POLICY "Authenticated users can view thresholds" ON sensor_thresholds
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Managers can insert thresholds" ON sensor_thresholds;
CREATE POLICY "Managers can insert thresholds" ON sensor_thresholds
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can update thresholds" ON sensor_thresholds;
CREATE POLICY "Managers can update thresholds" ON sensor_thresholds
    FOR UPDATE TO authenticated USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Managers can delete thresholds" ON sensor_thresholds;
CREATE POLICY "Managers can delete thresholds" ON sensor_thresholds
    FOR DELETE TO authenticated USING (true);

-- Alerts: Allow authenticated users to view and acknowledge
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON alerts;
CREATE POLICY "Authenticated users can view alerts" ON alerts
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "System can insert alerts" ON alerts;
CREATE POLICY "System can insert alerts" ON alerts
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update alerts to acknowledge" ON alerts;
CREATE POLICY "Users can update alerts to acknowledge" ON alerts
    FOR UPDATE TO authenticated USING (true)
    WITH CHECK (true);

-- Insert sample data (optional - for development)
-- Uncomment to add sample data

-- INSERT INTO users (name, email, password, role) VALUES
-- ('John Doe', 'john@example.com', '$2a$10$hashedpassword', 'manager'),
-- ('Jane Smith', 'jane@example.com', '$2a$10$hashedpassword', 'owner');