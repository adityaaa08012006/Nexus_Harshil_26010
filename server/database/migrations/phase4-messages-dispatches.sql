-- ============================================================================
-- Phase 4: Messages table for in-app messaging & dispatch enhancements
-- ============================================================================

-- ─── Messages table ─────────────────────────────────────────────────────────
-- Threads between QC Reps ↔ Managers per allocation request
CREATE TABLE IF NOT EXISTS messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id UUID NOT NULL REFERENCES allocation_requests(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_read       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_messages_allocation ON messages(allocation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender     ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created    ON messages(allocation_id, created_at);

-- ─── RLS policies ───────────────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages on allocation requests they are involved in
CREATE POLICY "Users can read messages for their allocations"
  ON messages FOR SELECT USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM allocation_requests ar
      WHERE ar.id = messages.allocation_id
      AND (ar.requester_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('manager', 'owner')
    )
  );

-- Users can insert their own messages
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );

-- ─── Add estimated_delivery to dispatches (if not exists) ───────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dispatches' AND column_name = 'estimated_delivery'
  ) THEN
    ALTER TABLE dispatches ADD COLUMN estimated_delivery TIMESTAMPTZ;
  END IF;
END $$;

-- ─── Enable realtime for messages ───────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
