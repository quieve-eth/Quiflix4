-- Add film hosting and trailer fields to films table
-- Supports external hosting (Google Drive, Dropbox, etc) and trailer uploads

ALTER TABLE public.films
ADD COLUMN IF NOT EXISTS film_hosted_link TEXT,
ADD COLUMN IF NOT EXISTS film_hosted_provider TEXT, -- 'google_drive', 'dropbox', 'custom'
ADD COLUMN IF NOT EXISTS trailer_url TEXT,
ADD COLUMN IF NOT EXISTS trailer_file_id TEXT, -- Reference to stored file
ADD COLUMN IF NOT EXISTS price_usd NUMERIC DEFAULT 9.99;

-- Create trailers table for managing uploaded trailer files
CREATE TABLE IF NOT EXISTS public.trailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES public.films(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size INT,
  duration_seconds INT,
  uploaded_by TEXT NOT NULL,
  storage_provider TEXT DEFAULT 'vercel_blob', -- 'vercel_blob', 'cloudinary', etc
  file_key TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for trailers
CREATE INDEX idx_trailers_film ON public.trailers(film_id);

-- Enable RLS on trailers table
ALTER TABLE public.trailers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trailers
CREATE POLICY "trailers_public_read" ON public.trailers FOR SELECT USING (true);
CREATE POLICY "trailers_public_insert" ON public.trailers FOR INSERT WITH CHECK (true);

-- Add release_year and poster_url columns if they don't exist
ALTER TABLE public.films
ADD COLUMN IF NOT EXISTS release_year INT,
ADD COLUMN IF NOT EXISTS poster_url TEXT;
