'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Copy, Share2, Film, Link2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DistributorAssets() {
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string>('');

  useEffect(() => {
    // Fetch distributor's films and assets
    const fetchAssets = async () => {
      try {
        // This would typically fetch from the distributor's API
        // For now, we'll show the structure
        setLoading(false);
      } catch (error) {
        console.error('[v0] Error fetching assets:', error);
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('[v0] Download failed:', error);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Marketing Assets</h1>
              <p className="text-sm text-muted-foreground">Download & share trailers and promotional materials</p>
            </div>
            <Link href="/distributor-dashboard">
              <Button variant="outline" className="bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Info Banner */}
        <Card className="bg-primary/10 border-primary/20 p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Share Trailers to Maximize Earnings</h3>
              <p className="text-sm text-muted-foreground">
                Download film trailers and share them on social media with your personalized distribution link. Every viewer who clicks from your social posts earns you 20% of the sale.
              </p>
            </div>
          </div>
        </Card>

        {/* Assets List */}
        <div className="space-y-6">
          {/* Sample Film 1 */}
          <Card className="bg-card border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Thumbnail */}
              <div className="bg-secondary/20 rounded-lg aspect-video flex items-center justify-center">
                <Film className="h-12 w-12 text-muted-foreground" />
              </div>

              {/* Film Details */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-2">Shadow of the Sun</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nigerian drama film | 112 minutes | Available now
                </p>

                {/* Download & Share Section */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Download Trailer
                    </label>
                    <Button
                      onClick={() => downloadFile('https://example.com/trailer.mp4', 'shadow-sun-trailer.mp4')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full"
                    >
                      <Download className="h-4 w-4" />
                      Download (MP4, 45MB)
                    </Button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Your Personalized Distribution Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="https://quiflix.com/distributor/abc123/film1"
                        readOnly
                        className="flex-1 px-3 py-2 bg-secondary/50 border border-border rounded text-sm text-foreground"
                      />
                      <Button
                        onClick={() => copyToClipboard('https://quiflix.com/distributor/abc123/film1', 'link-1')}
                        variant="outline"
                        className="bg-transparent gap-2"
                      >
                        {copiedId === 'link-1' ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Quick Share to Social Media
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['Instagram', 'TikTok', 'YouTube', 'Facebook'].map((platform) => (
                        <Button
                          key={platform}
                          variant="outline"
                          className="bg-transparent text-xs gap-1"
                          onClick={() => {
                            const message = `Check out this amazing film: Shadow of the Sun! Watch the trailer and get instant access. ${window.location.origin}/distributor/abc123/film1`;
                            // Would integrate with social sharing APIs
                            console.log(`[v0] Share to ${platform}:`, message);
                          }}
                        >
                          <Share2 className="h-3 w-3" />
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Sample Film 2 */}
          <Card className="bg-card border-border p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Thumbnail */}
              <div className="bg-secondary/20 rounded-lg aspect-video flex items-center justify-center">
                <Film className="h-12 w-12 text-muted-foreground" />
              </div>

              {/* Film Details */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-2">Urban Hearts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kenyan romance | 98 minutes | Available now
                </p>

                {/* Download & Share Section */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Download Trailer
                    </label>
                    <Button
                      onClick={() => downloadFile('https://example.com/trailer2.mp4', 'urban-hearts-trailer.mp4')}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full"
                    >
                      <Download className="h-4 w-4" />
                      Download (MP4, 38MB)
                    </Button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Your Personalized Distribution Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="https://quiflix.com/distributor/abc123/film2"
                        readOnly
                        className="flex-1 px-3 py-2 bg-secondary/50 border border-border rounded text-sm text-foreground"
                      />
                      <Button
                        onClick={() => copyToClipboard('https://quiflix.com/distributor/abc123/film2', 'link-2')}
                        variant="outline"
                        className="bg-transparent gap-2"
                      >
                        {copiedId === 'link-2' ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Quick Share to Social Media
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['Instagram', 'TikTok', 'YouTube', 'Facebook'].map((platform) => (
                        <Button
                          key={platform}
                          variant="outline"
                          className="bg-transparent text-xs gap-1"
                          onClick={() => {
                            const message = `Check out this amazing film: Urban Hearts! Watch the trailer and get instant access. ${window.location.origin}/distributor/abc123/film2`;
                            console.log(`[v0] Share to ${platform}:`, message);
                          }}
                        >
                          <Share2 className="h-3 w-3" />
                          {platform}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Marketing Tips */}
        <Card className="bg-secondary/20 border-border p-6 mt-8">
          <h3 className="text-lg font-bold mb-4">Pro Tips for Maximum Earnings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex gap-3">
              <div className="text-primary font-bold">1</div>
              <div>
                <p className="font-semibold mb-1">Post Consistently</p>
                <p className="text-muted-foreground">Share trailer clips 3-4 times per week for maximum reach</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-primary font-bold">2</div>
              <div>
                <p className="font-semibold mb-1">Include Your Link</p>
                <p className="text-muted-foreground">Always include your personalized link in captions and bio</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-primary font-bold">3</div>
              <div>
                <p className="font-semibold mb-1">Engage Audiences</p>
                <p className="text-muted-foreground">Ask questions, reply to comments, build community</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-primary font-bold">4</div>
              <div>
                <p className="font-semibold mb-1">Use Hashtags</p>
                <p className="text-muted-foreground">#FilmLovers #IndieFilm #NigerianCinema #KenyanFilm</p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
