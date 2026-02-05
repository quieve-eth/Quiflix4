'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Lock, Zap, DollarSign } from 'lucide-react';

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const filmId = params.filmId as string;
  const referralCode = searchParams.get('ref');

  const [filmData, setFilmData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'credit_card'>('mpesa');
  const [amountKes, setAmountKes] = useState<number>(0);
  const [amountUsd, setAmountUsd] = useState<number>(0);
  const [stablecoin, setStablecoin] = useState<'USDC' | 'USDT'>('USDC');
  const [processing, setProcessing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(0.0077);

  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const response = await fetch(`/api/films/${filmId}`);
        if (response.ok) {
          const data = await response.json();
          setFilmData(data);
          setAmountKes(Math.ceil((data.price_usd || 9.99) / exchangeRate));
        }
      } catch (error) {
        console.error('[v0] Error fetching film:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('/api/payment/exchange-rate');
        if (response.ok) {
          const data = await response.json();
          setExchangeRate(data.rate);
          if (filmData?.price_usd) {
            setAmountKes(Math.ceil(filmData.price_usd / data.rate));
          }
        }
      } catch (error) {
        console.error('[v0] Error fetching exchange rate:', error);
      }
    };

    fetchFilm();
    fetchExchangeRate();
  }, [filmId, exchangeRate, filmData?.price_usd]);

  // Update USD amount when KES amount changes
  useEffect(() => {
    setAmountUsd(amountKes * exchangeRate);
  }, [amountKes, exchangeRate]);

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      console.log('[v0] Initiating checkout:', {
        filmId,
        amountKes,
        stablecoin,
        paymentMethod,
      });

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filmId,
          amountKes,
          amountUsd,
          stablecoin,
          paymentMethod,
          referralCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Checkout created:', data.order_id);
        
        // Redirect to Pretium payment page
        if (data.payment_url) {
          window.location.href = data.payment_url;
        }
      } else {
        const error = await response.json();
        console.error('[v0] Checkout error:', error);
      }
    } catch (error) {
      console.error('[v0] Error during checkout:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading film details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-muted-foreground">Secure payment in Kenyan Shillings, settled in stablecoins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Payment Method Selection */}
          <div className="md:col-span-2 space-y-6">
            {/* Film Summary */}
            <Card className="bg-card border-border p-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-primary/20 rounded flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{filmData?.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{filmData?.description}</p>
                  <div className="flex gap-3">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                      {filmData?.genre}
                    </span>
                    <span className="px-2 py-1 bg-secondary/50 text-xs rounded">
                      {filmData?.duration_minutes} mins
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold mb-4">Payment Method</h3>
              
              <div className="space-y-3">
                {[
                  { id: 'mpesa', label: 'M-Pesa', icon: '📱' },
                  { id: 'credit_card', label: 'Credit/Debit Card', icon: '💳' },
                ].map((method) => (
                  <label key={method.id} className="flex items-center p-4 border-2 border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    style={{
                      borderColor: paymentMethod === method.id ? 'var(--color-primary)' : 'var(--color-border)',
                    }}>
                    <input
                      type="radio"
                      name="payment-method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="text-xl ml-3">{method.icon}</span>
                    <span className="ml-2 font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Stablecoin Selection */}
            <Card className="bg-card border-border p-6">
              <h3 className="text-lg font-bold mb-4">Receive As</h3>
              
              <div className="flex gap-3">
                {['USDC', 'USDT'].map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setStablecoin(coin as any)}
                    className={`flex-1 p-4 border-2 rounded-lg font-medium transition-colors ${
                      stablecoin === coin
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {coin}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Stablecoins are sent to your wallet on Base network
              </p>
            </Card>

            {/* Security Info */}
            <Card className="bg-card border-border p-6 border-green-500/30">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Secure & Private</h4>
                  <p className="text-sm text-muted-foreground">
                    All payments are encrypted and processed securely through Pretium. Your payment details are never stored.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <Card className="bg-card border-border p-6 h-fit sticky top-4">
            <h3 className="text-lg font-bold mb-6">Order Summary</h3>

            <div className="space-y-4 mb-6 pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Film Price (USD)</span>
                <span className="font-medium">${amountUsd.toFixed(2)}</span>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount in KES</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={amountKes}
                    onChange={(e) => setAmountKes(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Rate: 1 KES = {exchangeRate.toFixed(4)} USD
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">You will receive</p>
              <p className="text-2xl font-bold">{amountUsd.toFixed(2)} {stablecoin}</p>
              <p className="text-xs text-muted-foreground mt-1">On Base network</p>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={processing || !amountKes}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 disabled:opacity-50"
              size="lg"
            >
              {processing ? 'Processing...' : 'Proceed to Payment'}
              {!processing && <ArrowRight className="w-4 h-4" />}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              You will be redirected to Pretium to complete payment
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
