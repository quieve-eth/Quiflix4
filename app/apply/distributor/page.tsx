'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function DistributorApply() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    country: '',
    yearsInBusiness: '',
    distributionChannels: '',
    targetMarkets: '',
    experienceDescription: '',
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
      const response = await fetch('/api/applications/distributor', {
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
        companyName: '',
        country: '',
        yearsInBusiness: '',
        distributionChannels: '',
        targetMarkets: '',
        experienceDescription: '',
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
            <Link href="/apply/filmmaker" className="text-sm text-muted-foreground hover:text-foreground">
              Filmmaker?
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Apply as Distributor</h1>
          <p className="text-muted-foreground">
            Join Quiflix and earn 500 DDTs (Digital Distribution Tokens) per approved film. Our team will review and contact you within 5-7 business days.
          </p>
        </div>

        {success && (
          <Card className="bg-green-900/20 border-green-700 p-4 mb-6">
            <p className="text-green-200">
              ✓ Application submitted! We'll review your profile and contact you at {formData.email}
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

          {/* Business Information */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Business Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Years in Business *</label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Distribution Channels *</label>
              <textarea
                name="distributionChannels"
                value={formData.distributionChannels}
                onChange={handleChange}
                required
                rows={3}
                placeholder="e.g., Netflix, Amazon Prime, YouTube, theatrical, etc."
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Target Markets *</label>
              <textarea
                name="targetMarkets"
                value={formData.targetMarkets}
                onChange={handleChange}
                required
                rows={3}
                placeholder="e.g., Sub-Saharan Africa, East Africa, West Africa, etc."
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Experience & Background *</label>
              <textarea
                name="experienceDescription"
                value={formData.experienceDescription}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Tell us about your experience in film distribution, notable films you've distributed, and why you'd be a great fit for Quiflix"
                className="w-full px-4 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
