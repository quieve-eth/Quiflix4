-- Create filmmaker_applications table
CREATE TABLE IF NOT EXISTS public.filmmaker_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  film_title TEXT NOT NULL,
  film_description TEXT,
  genre TEXT,
  duration_minutes INTEGER,
  language TEXT,
  release_year INTEGER,
  film_poster_url TEXT,
  film_trailer_url TEXT,
  budget_usd DECIMAL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  submitted_by UUID,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create distributor_applications table
CREATE TABLE IF NOT EXISTS public.distributor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  years_in_business INTEGER,
  distribution_channels TEXT,
  target_markets TEXT,
  experience_description TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  ddt_tokens INTEGER DEFAULT 0,
  submitted_by UUID,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create ddt_ledger table for tracking digital distribution tokens
CREATE TABLE IF NOT EXISTS public.ddt_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  distributor_id UUID NOT NULL REFERENCES public.distributor_applications(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  film_id UUID,
  notes TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_filmmaker_applications_email ON public.filmmaker_applications(email);
CREATE INDEX IF NOT EXISTS idx_filmmaker_applications_status ON public.filmmaker_applications(status);
CREATE INDEX IF NOT EXISTS idx_distributor_applications_email ON public.distributor_applications(email);
CREATE INDEX IF NOT EXISTS idx_distributor_applications_status ON public.distributor_applications(status);
CREATE INDEX IF NOT EXISTS idx_ddt_ledger_distributor_id ON public.ddt_ledger(distributor_id);
