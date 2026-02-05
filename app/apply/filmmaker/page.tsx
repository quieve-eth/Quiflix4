'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function FilmmakerApply() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    filmTitle: '',
    filmDescription: '',
    genre: '',
    durationMinutes: '',
    language: '',
    releaseYear: '',
    filmPosterUrl: '',
    filmTrailerUrl: '',
    budgetUsd: '',
    filmHostedLink: '',
    filmHostedProvider: 'google_drive',
    priceUsd: '9.99',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/applications/filmmaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        filmTitle: '',
        filmDescription: '',
        genre: '',
        durationMinutes: '',
        language: '',
        releaseYear: '',
        filmPosterUrl: '',
        filmTrailerUrl: '',
        budgetUsd: '',
        filmHostedLink: '',
        filmHostedProvider: 'google_drive',
        priceUsd: '9.99',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
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
          <nav className="flex gap-4">
            <Link href="/apply/distributor" className="text-sm text-muted-foreground hover:text-foreground">
              Distributor?
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Apply as Filmmaker</h1>
          <p className="text-muted-foreground">
            Submit your film for distribution on Quiflix. Our team will review and get back to you within 5-7 business days.
          </p>
        </div>

        {success && (
          <Card className="bg-green-900/20 border-green-700 p-4 mb-6">
            <p className="text-green-200">
              ✓ Application submitted! We'll review your film and contact you at {formData.email}
            </p>
          </Card>
        )}

        {error && (
          <Card className="bg-red-900/20 border-red-700 p-4 mb-6">
            <p className="text-red-200">✗ {error}</p>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Country *</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Film Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Film Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Film Title *</label>
              <input
                type="text"
                name="filmTitle"
                value={formData.filmTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Film Description *</label>
              <textarea
                name="filmDescription"
                value={formData.filmDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genre *</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Drama, Action, Comedy"
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={formData.durationMinutes}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Language *</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                  placeholder="e.g., English, Swahili"
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Release Year *</label>
                <input
                  type="number"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Poster URL</label>
                <input
                  type="url"
                  name="filmPosterUrl"
                  value={formData.filmPosterUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trailer URL</label>
                <input
                  type="url"
                  name="filmTrailerUrl"
                  value={formData.filmTrailerUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Budget (USD)</label>
              <input
                type="number"
                name="budgetUsd"
                value={formData.budgetUsd}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Film Hosting & Price */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Film Hosting & Price</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Host your full film on Google Drive, Dropbox, or another cloud service. Distributors will get a personalized link to share with buyers.
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Film Hosting Provider *</label>
              <select
                name="filmHostedProvider"
                value={formData.filmHostedProvider}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="google_drive">Google Drive</option>
                <option value="dropbox">Dropbox</option>
                <option value="onedrive">OneDrive</option>
                <option value="custom">Custom Link</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Film Hosting Link *</label>
              <input
                type="url"
                name="filmHostedLink"
                value={formData.filmHostedLink}
                onChange={handleChange}
                required
                placeholder="https://drive.google.com/file/d/... or https://www.dropbox.com/..."
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Share the public link to your film file. Make sure it's publicly accessible.
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Selling Price (USD) *</label>
              <div className="flex items-center gap-2">
                <span className="text-foreground">$</span>
                <input
                  type="number"
                  name="priceUsd"
                  value={formData.priceUsd}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0.99"
                  className="flex-1 px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Revenue split: 70% to you, 20% to distributor, 10% to Quiflix
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
