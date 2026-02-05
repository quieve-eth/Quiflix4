-- DDT Token Management Schema
-- Tracks blockchain interactions, sales, and payouts for the Web2-Web3 hybrid system

-- Films table (extended with blockchain info)
CREATE TABLE IF NOT EXISTS public.films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id BIGINT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  filmmaker_email TEXT NOT NULL,
  filmmaker_wallet TEXT,
  description TEXT,
  genre TEXT,
  duration_minutes INT,
  language TEXT,
  ipfs_hash TEXT,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP,
  ddt_pool_minted BOOLEAN DEFAULT false,
  smart_contract_film_id BIGINT,
  total_sales_value NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Distributors table (extended with blockchain info)
CREATE TABLE IF NOT EXISTS public.distributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id BIGINT NOT NULL UNIQUE,
  wallet_address TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  country TEXT,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMP,
  registered_on_chain BOOLEAN DEFAULT false,
  smart_contract_distributor_id BIGINT,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DDT Holdings (tracks which distributor holds DDTs for which film)
CREATE TABLE IF NOT EXISTS public.ddt_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  film_id UUID NOT NULL REFERENCES public.films(id),
  ddt_balance INT DEFAULT 0,
  personalized_link TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  sales_attributed NUMERIC DEFAULT 0,
  earned_amount NUMERIC DEFAULT 0,
  assigned_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales Records (tracks every purchase made through a distributor's link)
CREATE TABLE IF NOT EXISTS public.sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES public.films(id),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  ddt_holding_id UUID NOT NULL REFERENCES public.ddt_holdings(id),
  sale_amount NUMERIC NOT NULL,
  buyer_email TEXT,
  payment_method TEXT,
  payment_id TEXT,
  transaction_hash TEXT,
  recorded_on_chain BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Revenue Payouts (tracks revenue split and payment status)
CREATE TABLE IF NOT EXISTS public.revenue_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id UUID NOT NULL REFERENCES public.films(id),
  distributor_id UUID NOT NULL REFERENCES public.distributors(id),
  sale_id UUID NOT NULL REFERENCES public.sales_records(id),
  filmmaker_share NUMERIC NOT NULL,
  distributor_share NUMERIC NOT NULL,
  goodflix_share NUMERIC NOT NULL,
  total_sale_amount NUMERIC NOT NULL,
  filmmaker_paid BOOLEAN DEFAULT false,
  distributor_paid BOOLEAN DEFAULT false,
  goodflix_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DDT Ledger (audit trail for all DDT operations)
CREATE TABLE IF NOT EXISTS public.ddt_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL, -- 'MINT', 'ASSIGN', 'TRANSFER', 'BURN'
  film_id UUID REFERENCES public.films(id),
  distributor_id UUID REFERENCES public.distributors(id),
  ddt_amount INT,
  from_address TEXT,
  to_address TEXT,
  transaction_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deployment Info (stores smart contract deployment details)
CREATE TABLE IF NOT EXISTS public.smart_contract_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name TEXT NOT NULL,
  network TEXT NOT NULL, -- 'base_mainnet', 'base_sepolia', etc
  contract_address TEXT NOT NULL UNIQUE,
  deployer_address TEXT NOT NULL,
  deployment_tx_hash TEXT,
  abi_json JSONB,
  deployed_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Admin Settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goodflix_wallet TEXT NOT NULL,
  filmmaker_split INT DEFAULT 70,
  distributor_split INT DEFAULT 20,
  goodflix_split INT DEFAULT 10,
  max_distributors_per_film INT DEFAULT 500,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_films_approved ON public.films(approved);
CREATE INDEX idx_films_filmmaker_email ON public.films(filmmaker_email);
CREATE INDEX idx_distributors_approved ON public.distributors(approved);
CREATE INDEX idx_distributors_wallet ON public.distributors(wallet_address);
CREATE INDEX idx_ddt_holdings_distributor ON public.ddt_holdings(distributor_id);
CREATE INDEX idx_ddt_holdings_film ON public.ddt_holdings(film_id);
CREATE INDEX idx_sales_records_film ON public.sales_records(film_id);
CREATE INDEX idx_sales_records_distributor ON public.sales_records(distributor_id);
CREATE INDEX idx_sales_records_created ON public.sales_records(created_at);
CREATE INDEX idx_revenue_payouts_film ON public.revenue_payouts(film_id);
CREATE INDEX idx_revenue_payouts_distributor ON public.revenue_payouts(distributor_id);
CREATE INDEX idx_ddt_ledger_film ON public.ddt_ledger(film_id);
CREATE INDEX idx_ddt_ledger_distributor ON public.ddt_ledger(distributor_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ddt_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ddt_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contract_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read, authenticated write (controlled by app logic)
CREATE POLICY "films_public_read" ON public.films FOR SELECT USING (true);
CREATE POLICY "films_public_insert" ON public.films FOR INSERT WITH CHECK (true);

CREATE POLICY "distributors_public_read" ON public.distributors FOR SELECT USING (true);
CREATE POLICY "distributors_public_insert" ON public.distributors FOR INSERT WITH CHECK (true);

CREATE POLICY "ddt_holdings_public_read" ON public.ddt_holdings FOR SELECT USING (true);
CREATE POLICY "ddt_holdings_public_insert" ON public.ddt_holdings FOR INSERT WITH CHECK (true);

CREATE POLICY "sales_records_public_read" ON public.sales_records FOR SELECT USING (true);
CREATE POLICY "sales_records_public_insert" ON public.sales_records FOR INSERT WITH CHECK (true);

CREATE POLICY "revenue_payouts_public_read" ON public.revenue_payouts FOR SELECT USING (true);

CREATE POLICY "ddt_ledger_public_read" ON public.ddt_ledger FOR SELECT USING (true);

CREATE POLICY "smart_contract_deployments_public_read" ON public.smart_contract_deployments FOR SELECT USING (true);

CREATE POLICY "admin_settings_public_read" ON public.admin_settings FOR SELECT USING (true);

-- Insert default admin settings
INSERT INTO public.admin_settings (goodflix_wallet, filmmaker_split, distributor_split, goodflix_split, max_distributors_per_film)
VALUES ('0x0000000000000000000000000000000000000000', 70, 20, 10, 500)
ON CONFLICT DO NOTHING;
