-- ─── Phase 7: Contact Management ─────────────────────────────────────────────
-- Run this in your Supabase SQL Editor (Settings → SQL Editor)

-- 1. Add buyer-specific columns to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS purchase_volume NUMERIC(12, 2);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_crops TEXT[];

-- Allow 'both' already in schema; ensure 'buyer' is accepted too (no change needed if already in CHECK)

-- 2. Contact interaction logs
CREATE TABLE IF NOT EXISTS contact_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'order', 'negotiation', 'note', 'visit')),
    summary TEXT NOT NULL,
    logged_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_logs_contact ON contact_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_logs_logged_at ON contact_logs(logged_at DESC);

-- 3. Price reference table (per-contact, per-crop)
CREATE TABLE IF NOT EXISTS contact_price_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    offered_price NUMERIC(10, 2),
    market_price NUMERIC(10, 2),
    unit VARCHAR(20) DEFAULT 'kg',
    notes TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_refs_contact ON contact_price_references(contact_id);
CREATE INDEX IF NOT EXISTS idx_price_refs_crop ON contact_price_references(crop);

-- 4. RLS Policies ──────────────────────────────────────────────────────────────

ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_price_references ENABLE ROW LEVEL SECURITY;

-- contact_logs: authenticated users can read
CREATE POLICY "Authenticated users can read contact logs"
  ON contact_logs FOR SELECT
  TO authenticated USING (true);

-- contact_logs: owner/manager can insert
CREATE POLICY "Owner and manager can insert contact logs"
  ON contact_logs FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('owner', 'manager')
    )
  );

-- contact_logs: owner can delete
CREATE POLICY "Owner can delete contact logs"
  ON contact_logs FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- contact_price_references: authenticated read
CREATE POLICY "Authenticated users can read price references"
  ON contact_price_references FOR SELECT
  TO authenticated USING (true);

-- contact_price_references: owner can insert/update/delete
CREATE POLICY "Owner can manage price references"
  ON contact_price_references FOR ALL
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- 5. Updated_at trigger for contacts (if not already)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
