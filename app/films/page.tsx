'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Film, Play, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export default function FilmsPage() {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const genres = ['all', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Action', 'Documentary'];

  const films = [
    {
      id: 1,
      title: 'Shadow of the Sun',
      location: 'Nigeria',
      genre: 'Drama',
      sales: '8.2K',
      earnings: '$5.7K',
      director: 'Chisom Okeke',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop',
    },
    {
      id: 2,
      title: 'Urban Hearts',
      location: 'Kenya',
      genre: 'Romance',
      sales: '4.2K',
      earnings: '$2.9K',
      director: 'David Mwangi',
      poster: 'https://images.unsplash.com/photo-1489599849228-eb342ebb47e1?w=500&h=750&fit=crop',
    },
    {
      id: 3,
      title: 'Echoes',
      location: 'South Africa',
      genre: 'Thriller',
      sales: '3.1K',
      earnings: '$2.2K',
      director: 'Thandi Nkosi',
      poster: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&h=750&fit=crop',
    },
    {
      id: 4,
      title: 'The Last Journey',
      location: 'Tanzania',
      genre: 'Documentary',
      sales: '2.8K',
      earnings: '$1.9K',
      director: 'Grace Moshi',
      poster: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=500&h=750&fit=crop',
    },
    {
      id: 5,
      title: 'Laughs & Love',
      location: 'Uganda',
      genre: 'Comedy',
      sales: '5.4K',
      earnings: '$3.8K',
      director: 'Patrick Lubega',
      poster: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&h=750&fit=crop',
    },
    {
      id: 6,
      title: 'Crimson Skies',
      location: 'Ghana',
      genre: 'Action',
      sales: '6.1K',
      earnings: '$4.3K',
      director: 'Ama Asante',
      poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=750&fit=crop',
    },
  ];

  const filteredFilms = films.filter((film) => {
    const matchesGenre = selectedGenre === 'all' || film.genre === selectedGenre;
    const matchesSearch =
      film.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      film.director.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/quiflix-logo.png"
              alt="Quiflix"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold">Quiflix</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 animate-slideDown">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-glow">Browse Films</h1>
          <p className="text-lg text-muted-foreground">Discover films from creators around the world</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12 space-y-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by film title or director..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedGenre === genre
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:border-primary/50'
                }`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Films Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          {filteredFilms.map((film, index) => (
            <Card key={film.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 group cursor-pointer animate-slideUp" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                <img
                  src={film.poster || "/placeholder.svg"}
                  alt={film.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <Play className="h-12 w-12 text-primary/40 group-hover:text-primary/80 transition-colors animate-pulse" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{film.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{film.director}</p>
                <div className="flex gap-2 mb-4 text-sm">
                  <span className="text-muted-foreground">{film.location}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{film.genre}</span>
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sales:</span>
                    <span className="text-primary font-semibold">{film.sales}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Earnings:</span>
                    <span className="text-primary font-semibold">{film.earnings}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredFilms.length === 0 && (
          <div className="text-center py-12">
            <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No films found matching your criteria</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center text-muted-foreground text-sm mt-24">
        <p>© 2024 Quiflix. All rights reserved.</p>
      </footer>
    </div>
  );
}
