'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Copy, ExternalLink, TrendingUp, DollarSign, Film, LogOut } from 'lucide-react';

interface DDTHolding {
  id: string;
  film_id: string;
  ddt_balance: number;
  personalized_link: string;
  sales_attributed: number;
  earned_amount: number;
  film_title?: string;
}

export default function DistributorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [holdings, setHoldings] = useState<DDTHolding[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }

    setUser(user);
    fetchDistributorData(user.id);
  };

  const fetchDistributorData = async (userId: string) => {
    const supabase = createClient();

    try {
      // Fetch distributor info
      const { data: distributorData } = await supabase
        .from('distributors')
        .select('*')
        .eq('id', userId)
        .single();

      if (!distributorData) {
        setLoading(false);
        return;
      }

      // Fetch DDT holdings
      const { data: holdingsData } = await supabase
        .from('ddt_holdings')
        .select('*')
        .eq('distributor_id', userId);

      if (holdingsData) {
        // Fetch film details for each holding
        const holdingsWithFilms = await Promise.all(
          holdingsData.map(async (holding) => {
            const { data: film } = await supabase
              .from('films')
              .select('title')
              .eq('id', holding.film_id)
              .single();

            return {
              ...holding,
              film_title: film?.title || 'Unknown Film',
            };
          })
        );

        setHoldings(holdingsWithFilms);

        // Calculate totals
        const earnings = holdingsWithFilms.reduce((sum, h) => sum + (h.earned_amount || 0), 0);
        const sales = holdingsWithFilms.reduce((sum, h) => sum + (h.sales_attributed || 0), 0);

        setTotalEarnings(earnings);
        setTotalSales(sales);
      }
    } catch (error) {
      console.error('Error fetching distributor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, linkId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/quiflix-logo.png"
              alt="Quiflix"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold">Distributor Portal</span>
          </Link>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {user?.user_metadata?.company_name || 'Your Distribution Portal'}
          </h1>
          <p className="text-muted-foreground">
            Manage your DDTs, track sales, and monitor earnings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Active DDTs</p>
                <p className="text-3xl font-bold">{holdings.length}</p>
              </div>
              <Film className="h-5 w-5 text-primary" />
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Sales</p>
                <p className="text-3xl font-bold">
                  ${(totalSales / 100).toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Earnings (20%)</p>
                <p className="text-3xl font-bold text-primary">
                  ${(totalEarnings / 100).toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </Card>
        </div>

        {/* DDT Holdings */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your DDTs & Distribution Links</h2>

          {holdings.length === 0 ? (
            <Card className="bg-card border-border p-8 text-center">
              <p className="text-muted-foreground mb-4">No DDTs assigned yet</p>
              <p className="text-sm text-muted-foreground">
                Once approved, you'll receive DDT assignments and personalized links here
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding) => (
                <Card key={holding.id} className="bg-card border-border p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Film Info */}
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Film</p>
                      <h3 className="text-lg font-semibold">{holding.film_title}</h3>
                      <div className="mt-3 inline-block px-2 py-1 bg-primary/10 rounded text-xs font-semibold text-primary">
                        {holding.ddt_balance} DDT
                      </div>
                    </div>

                    {/* Sales Info */}
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Sales Attributed</p>
                      <p className="text-2xl font-bold">
                        ${(holding.sales_attributed / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Through your personalized link
                      </p>
                    </div>

                    {/* Earnings Info */}
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Your Earnings (20%)</p>
                      <p className="text-2xl font-bold text-primary">
                        ${(holding.earned_amount / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Personalized Link */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Your Personalized Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={holding.personalized_link}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm text-foreground"
                      />
                      <Button
                        onClick={() => copyToClipboard(holding.personalized_link, holding.id)}
                        size="sm"
                        variant="outline"
                        className="bg-transparent gap-1"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedLink === holding.id ? 'Copied!' : 'Copy'}
                      </Button>
                      <a
                        href={holding.personalized_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this link with your audience. All sales through it attribute to your DDT.
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="bg-card border-border p-6 border-primary/30">
          <h3 className="font-semibold mb-3">How Your DDTs Work</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">1 DDT</span> = Limited exclusive distribution license
              for this film
            </li>
            <li>
              <span className="text-foreground font-medium">Your Earnings:</span> 20% of all sales through your
              personalized link
            </li>
            <li>
              <span className="text-foreground font-medium">Filmmaker:</span> Receives 70% of all sales
            </li>
            <li>
              <span className="text-foreground font-medium">Goodflix:</span> Platform fee 10%
            </li>
            <li className="pt-2">
              Revenue is automatically calculated on-chain and available for withdrawal
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
