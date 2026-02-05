-- Create wallets table for filmmakers and distributors
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_type TEXT NOT NULL CHECK (user_type IN ('filmmaker', 'distributor', 'platform')),
  user_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL UNIQUE,
  wallet_private_key_encrypted TEXT NOT NULL,
  currency TEXT DEFAULT 'KES',
  supported_stablecoins TEXT[] DEFAULT ARRAY['USDC', 'USDT'],
  balance_usdc NUMERIC(18, 6) DEFAULT 0,
  balance_usdt NUMERIC(18, 6) DEFAULT 0,
  balance_kes NUMERIC(18, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('filmmaker', 'distributor', 'buyer')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'refund', 'payout', 'onramp')),
  amount_kes NUMERIC(18, 2),
  amount_usd NUMERIC(18, 2),
  stablecoin_type TEXT CHECK (stablecoin_type IN ('USDC', 'USDT')),
  stablecoin_amount NUMERIC(18, 6),
  exchange_rate_kes_to_usd NUMERIC(10, 6),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  pretium_transaction_id TEXT,
  blockchain_tx_hash TEXT,
  payment_method TEXT CHECK (payment_method IN ('pretium', 'credit_card', 'mpesa', 'bank_transfer')),
  film_id UUID REFERENCES public.films(id),
  distributor_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exchange rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_pair TEXT NOT NULL UNIQUE,
  rate NUMERIC(10, 6) NOT NULL,
  source TEXT DEFAULT 'pretium',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  payment_method_type TEXT NOT NULL CHECK (payment_method_type IN ('mpesa', 'credit_card', 'bank_transfer')),
  mpesa_phone TEXT,
  card_last_four TEXT,
  card_brand TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id, user_type);
CREATE INDEX idx_wallets_address ON public.wallets(wallet_address);
CREATE INDEX idx_payment_transactions_user ON public.payment_transactions(user_id, user_type);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status, created_at);
CREATE INDEX idx_payment_transactions_film ON public.payment_transactions(film_id);
CREATE INDEX idx_payment_methods_user ON public.payment_methods(user_id);
