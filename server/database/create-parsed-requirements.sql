-- Create parsed_requirements table for storing PDF parsing results
-- This table stores agricultural requirement data extracted from PDFs using Gemini AI

CREATE TABLE IF NOT EXISTS public.parsed_requirements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  filename character varying NOT NULL,
  extracted_text text,
  parsed_items jsonb NOT NULL,
  raw_response text,
  status character varying DEFAULT 'draft'::character varying 
    CHECK (status::text = ANY (ARRAY[
      'draft'::character varying, 
      'edited'::character varying, 
      'published'::character varying, 
      'archived'::character varying
    ]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  
  CONSTRAINT parsed_requirements_pkey PRIMARY KEY (id),
  CONSTRAINT parsed_requirements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parsed_requirements_user_id ON public.parsed_requirements(user_id);
CREATE INDEX IF NOT EXISTS idx_parsed_requirements_status ON public.parsed_requirements(status);
CREATE INDEX IF NOT EXISTS idx_parsed_requirements_created_at ON public.parsed_requirements(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_parsed_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_parsed_requirements_updated_at
  BEFORE UPDATE ON public.parsed_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_parsed_requirements_updated_at();

-- Add RLS policies
ALTER TABLE public.parsed_requirements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own parsed requirements
CREATE POLICY "Users can view own parsed requirements"
  ON public.parsed_requirements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own parsed requirements
CREATE POLICY "Users can insert own parsed requirements"
  ON public.parsed_requirements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own parsed requirements
CREATE POLICY "Users can update own parsed requirements"
  ON public.parsed_requirements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own parsed requirements
CREATE POLICY "Users can delete own parsed requirements"
  ON public.parsed_requirements
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.parsed_requirements IS 'Stores agricultural requirement data extracted from PDF documents using Gemini AI';
COMMENT ON COLUMN public.parsed_requirements.extracted_text IS 'Raw text extracted from the PDF';
COMMENT ON COLUMN public.parsed_requirements.parsed_items IS 'JSON array of parsed agricultural items with crop, quantity, location, etc.';
COMMENT ON COLUMN public.parsed_requirements.status IS 'Processing status: draft (just parsed), edited (user modified), published (converted to allocation requests), archived';
