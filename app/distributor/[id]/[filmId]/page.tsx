'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Copy, Check, Share2, TrendingUp } from 'lucide-react';

interface Film {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration_minutes: number;
  language: string;
  total_sales_value: number;
  trailer_url?: string;
  film_hosted_link?: string;
  price_usd?: number;
  poster_url?: string;
}

interface DDTHolding {
  id: string;
  personalized_link: string;
  sales_attributed: number;
  earned_amount: number;
  ddt_balance: number;
}

export default function DistributorFilmPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const distributorId = params.id as string;
  const filmId = params.filmId as string;
  const referralCode = searchParams.get('ref');

  const [film, setFilm] = useState<Film | null>(null);
  const [holding, setHolding] = useState<DDTHolding | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch film details
        const filmRes = await fetch(`/api/films/${filmId}`);
        if (filmRes.ok) {
          const filmData = await filmRes.json();
          setFilm(filmData.data);
        }

        // Fetch DDT holding details
        const holdingRes = await fetch(
          `/api/ddt/holding?distributorId=${distributorId}&filmId=${filmId}`
        );
        if (holdingRes.ok) {
          const holdingData = await holdingRes.json();
          setHolding(holdingData.data);
        }
      } catch (error) {
        console.error('[v0] Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [distributorId, filmId]);

  const copyToClipboard = async () => {
    if (holding?.personalized_link) {
      await navigator.clipboard.writeText(holding.personalized_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (holding?.personalized_link && navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${film?.title} on Quiflix`,
          text: `Watch ${film?.title} - Available on Quiflix`,
          url: holding.personalized_link,
        });
      } catch (error) {
        console.error('[v0] Share failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading film details...</p>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Film not found</p>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/quiflix-logo.png"
              alt="Quiflix"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold">Quiflix Distributor</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Film Trailer */}
        {film.trailer_url && (
          <Card className="bg-card border-border p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">Watch the Trailer</h3>
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <video
                src={film.trailer_url}
                controls
                className="w-full h-full"
                poster={film.poster_url}
              />
            </div>
          </Card>
        )}

        {/* Film Details */}
        <Card className="bg-card border-border p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Film Info */}
            <div className="md:col-span-2">
              <h2 className="text-4xl font-bold mb-4">{film.title}</h2>
              
              <div className="flex gap-3 mb-6 flex-wrap">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded text-sm font-medium">
                  {film.genre}
                </span>
                <span className="px-3 py-1 bg-secondary/50 text-foreground rounded text-sm">
                  {film.duration_minutes} mins
                </span>
                <span className="px-3 py-1 bg-secondary/50 text-foreground rounded text-sm">
                  {film.language}
                </span>
                {film.price_usd && (
                  <span className="px-3 py-1 bg-primary rounded text-primary-foreground text-sm font-bold">
                    ${film.price_usd.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-8 text-lg">{film.description}</p>

              {/* Earnings Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 rounded border border-border">
                  <p className="text-muted-foreground text-sm mb-1">Your Earnings (20%)</p>
                  <p className="text-2xl font-bold text-primary">
                    ${holding?.earned_amount.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded border border-border">
                  <p className="text-muted-foreground text-sm mb-1">Sales Through Your Link</p>
                  <p className="text-2xl font-bold">
                    ${holding?.sales_attributed.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Holding Stats */}
            <div>
              <Card className="bg-background border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">Your DDT</h3>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground text-sm mb-2">Active Tokens</p>
                  <p className="text-4xl font-bold text-primary">{holding?.ddt_balance}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Film ID</span>
                    <span className="font-mono">{filmId.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distributor ID</span>
                    <span className="font-mono">{distributorId.substring(0, 8)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Referral Link Section */}
        <Card className="bg-card border-border p-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Your Personal Distribution Link</h3>
          <p className="text-muted-foreground text-center mb-6">
            Share this link to start earning 20% commission on every sale
          </p>

          {holding?.personalized_link && (
            <div className="bg-background/50 border border-border rounded-lg p-6 mb-6">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Distribution Link</p>
                  <p className="text-sm font-mono break-all text-primary">
                    {holding.personalized_link}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="bg-transparent gap-2"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  {navigator.share && (
                    <Button
                      onClick={shareLink}
                      variant="outline"
                      className="bg-transparent gap-2"
                      size="sm"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {referralCode && (
            <div className="bg-background/50 border border-border rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-1">Referral Code</p>
              <p className="font-mono text-sm text-primary">{referralCode}</p>
            </div>
          )}

          {/* Distribution Tips */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h4 className="font-bold mb-3">Tips to Maximize Your Earnings</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Share on social media, email lists, and partner networks</li>
              <li>✓ Include the link in your website and marketing materials</li>
              <li>✓ Every unique viewer who purchases through your link earns you 20%</li>
              <li>✓ Track real-time earnings in your distributor dashboard</li>
              <li>✓ Payouts are automatic to your connected wallet</li>
            </ul>
          </div>
        </Card>

        {/* Buy Button */}
        {film.film_hosted_link && (
          <div className="mt-12 text-center bg-primary/10 border border-primary/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Own This Film?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              By purchasing through this link, you support this filmmaker and distributor while getting access to the full film.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`/checkout/${filmId}?ref=${referralCode}`}>
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto"
                >
                  Buy Now - ${film.price_usd?.toFixed(2) || 'TBD'}
                </Button>
              </a>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent w-full sm:w-auto"
                onClick={() => {
                  // Video preview or info
                  if (film.trailer_url) {
                    window.open(film.trailer_url, '_blank');
                  }
                }}
              >
                Watch Trailer
              </Button>
            </div>
          </div>
        )}

        {/* Distributor Dashboard Link */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Are you a distributor?</p>
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Go to Distributor Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
