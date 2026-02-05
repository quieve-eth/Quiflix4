'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Play, Download, Edit2, Trash2, Plus, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Film {
  id: string;
  title: string;
  filmmaker_email: string;
  film_hosted_link: string;
  film_hosted_provider: string;
  trailer_url: string;
  price_usd: number;
  poster_url?: string;
  description: string;
  approved: boolean;
  total_sales_value: number;
}

export default function FilmmakerDashboard() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // In production, fetch from Supabase
    console.log('[v0] Filmmaker dashboard loaded - connect to Supabase for data');
    setLoading(false);
  }, []);

  const handleTrailerUpload = async () => {
    if (!trailerFile || !selectedFilm) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', trailerFile);
      formData.append('filmId', selectedFilm.id);

      const response = await fetch('/api/upload-trailer', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[v0] Trailer uploaded:', data);
        setShowUploadModal(false);
        setTrailerFile(null);
        // Refresh films
      }
    } catch (error) {
      console.error('[v0] Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/quiflix-logo.png"
              alt="Quiflix"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold">Quiflix</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#earnings" className="text-sm hover:text-primary">
              Earnings
            </a>
            <a href="#analytics" className="text-sm hover:text-primary">
              Analytics
            </a>
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Films</h1>
          <p className="text-muted-foreground">
            Manage your films, upload trailers, and track earnings from distributors
          </p>
        </div>

        {/* Films Grid */}
        <div className="space-y-4">
          {films.length === 0 ? (
            <Card className="bg-card border-border p-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No films yet</h3>
              <p className="text-muted-foreground mb-6">
                Your approved films will appear here
              </p>
              <Link href="/apply/filmmaker">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Apply with a Film
                </Button>
              </Link>
            </Card>
          ) : (
            films.map((film) => (
              <Card key={film.id} className="bg-card border-border p-6">
                <div className="flex gap-6">
                  {/* Poster */}
                  {film.poster_url && (
                    <div className="w-32 h-48 flex-shrink-0 bg-muted rounded overflow-hidden">
                      <Image
                        src={film.poster_url || "/placeholder.svg"}
                        alt={film.title}
                        width={128}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Film Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{film.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {film.approved ? (
                            <span className="text-green-400">✓ Approved</span>
                          ) : (
                            <span className="text-yellow-400">⏱ Pending Review</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${film.price_usd}</p>
                        <p className="text-xs text-muted-foreground">Selling price</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {film.description}
                    </p>

                    {/* Film Links */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-background p-3 rounded border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Full Film</p>
                        <a
                          href={film.film_hosted_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate block"
                        >
                          {film.film_hosted_provider.toUpperCase()} Link →
                        </a>
                      </div>
                      <div className="bg-background p-3 rounded border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Trailer</p>
                        {film.trailer_url ? (
                          <a
                            href={film.trailer_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-2"
                          >
                            <Play className="h-3 w-3" />
                            Watch
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not uploaded</span>
                        )}
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="bg-primary/10 p-3 rounded border border-primary/20 mb-4">
                      <p className="text-xs text-muted-foreground">Total Sales Revenue</p>
                      <p className="text-xl font-bold text-primary">
                        ${film.total_sales_value.toFixed(2)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => {
                          setSelectedFilm(film);
                          setShowUploadModal(true);
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Trailer
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Earnings Section */}
        <section id="earnings" className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold mb-6">Total Earnings</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground mb-2">Lifetime Earnings</p>
              <p className="text-3xl font-bold text-primary">$0.00</p>
            </Card>
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground mb-2">Active Distributors</p>
              <p className="text-3xl font-bold">0</p>
            </Card>
            <Card className="bg-card border-border p-6 text-center">
              <p className="text-muted-foreground mb-2">Total Sales</p>
              <p className="text-3xl font-bold">0</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Trailer Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Upload Trailer</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a video trailer for <strong>{selectedFilm?.title}</strong>
            </p>

            <div className="border-2 border-dashed border-border rounded p-6 text-center mb-4 cursor-pointer hover:border-primary transition">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setTrailerFile(e.target.files?.[0] || null)}
                className="hidden"
                id="trailer-input"
              />
              <label htmlFor="trailer-input" className="cursor-pointer">
                {trailerFile ? (
                  <div>
                    <Play className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium">{trailerFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload trailer</p>
                    <p className="text-xs text-muted-foreground">MP4, WebM up to 500MB</p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTrailerUpload}
                disabled={!trailerFile || uploading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                onClick={() => {
                  setShowUploadModal(false);
                  setTrailerFile(null);
                }}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
