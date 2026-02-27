-- Add parsed_requirements table for storing PDF parsing results
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS parsed_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    extracted_text TEXT,
    parsed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_response TEXT,
    status VARCHAR(50) DEFAULT 'parsed' CHECK (status IN ('parsed', 'edited', 'published', 'cancelled')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_parsed_requirements_user ON parsed_requirements(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_requirements_status ON parsed_requirements(status);
CREATE INDEX IF NOT EXISTS idx_parsed_requirements_created ON parsed_requirements(created_at DESC);

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_parsed_requirements_updated_at ON parsed_requirements;
CREATE TRIGGER update_parsed_requirements_updated_at BEFORE UPDATE ON parsed_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE parsed_requirements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own parsed requirements
CREATE POLICY "Users can view own parsed requirements"
    ON parsed_requirements FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own parsed requirements
CREATE POLICY "Users can insert own parsed requirements"
    ON parsed_requirements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own parsed requirements
CREATE POLICY "Users can update own parsed requirements"
    ON parsed_requirements FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own parsed requirements
CREATE POLICY "Users can delete own parsed requirements"
    ON parsed_requirements FOR DELETE
    USING (auth.uid() = user_id);

COMMENT ON TABLE parsed_requirements IS 'Stores PDF parsing results with Gemini AI for agricultural requirements';
COMMENT ON COLUMN parsed_requirements.parsed_items IS 'JSONB array of extracted items with crop, quantity, location, etc.';
COMMENT ON COLUMN parsed_requirements.status IS 'parsed = just parsed, edited = user modified, published = converted to allocation requests';
