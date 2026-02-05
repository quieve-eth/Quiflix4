'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminApplications() {
  const [filmmakerApps, setFilmmakerApps] = useState<any[]>([]);
  const [distributorApps, setDistributorApps] = useState<any[]>([]);
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'filmmaker' | 'distributor'>('filmmaker');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [approvalInProgress, setApprovalInProgress] = useState<string | null>(null);
  const [selectedFilmForDDT, setSelectedFilmForDDT] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>(process.env.NEXT_PUBLIC_QUIFLIX_DDT_CONTRACT || '');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const supabase = createClient();

    // Fetch filmmaker applications
    const { data: filmmakers } = await supabase
      .from('filmmaker_applications')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch distributor applications
    const { data: distributors } = await supabase
      .from('distributor_applications')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch approved films
    const { data: approvedFilms } = await supabase
      .from('films')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    setFilmmakerApps(filmmakers || []);
    setDistributorApps(distributors || []);
    setFilms(approvedFilms || []);
    setLoading(false);
  };

  const handleApprove = async (appId: string, type: 'filmmaker' | 'distributor') => {
    setApprovalInProgress(appId);
    try {
      const supabase = createClient();
      const app = type === 'filmmaker'
        ? filmmakerApps.find(a => a.id === appId)
        : distributorApps.find(a => a.id === appId);

      const table = type === 'filmmaker' ? 'filmmaker_applications' : 'distributor_applications';

      // Update status to approved
      const { error: updateError } = await supabase
        .from(table)
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'admin',
        })
        .eq('id', appId);

      if (updateError) {
        console.error('Update error:', updateError);
        return;
      }

      // If filmmaker, also approve on smart contract
      if (type === 'filmmaker') {
        // Register film on chain
        console.log('[v0] Filmmaker approved - would register on smart contract');
        // In production, would call contract to register film and mint 500 DDTs
      }

      // If distributor, assign DDT to selected film
      if (type === 'distributor' && selectedFilmForDDT) {
        console.log('[v0] Assigning DDT to distributor for film:', selectedFilmForDDT);

        // Call API to assign DDT
        const response = await fetch('/api/admin/approve-and-mint-ddt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            distributorId: appId,
            filmId: selectedFilmForDDT,
            distributorEmail: app.email,
            distributorWallet: app.wallet_address || '0x0',
            contractAddress,
          }),
        });

        if (!response.ok) {
          console.error('DDT assignment failed');
        }
      }

      // Send approval email
      await fetch('/api/admin/send-approval-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: app.email,
          type,
          status: 'approved',
          companyName: type === 'distributor' ? app.company_name : undefined,
        }),
      });

      setSelectedFilmForDDT('');
      fetchApplications();
    } finally {
      setApprovalInProgress(null);
    }
  };

  const handleReject = async (appId: string, type: 'filmmaker' | 'distributor') => {
    setApprovalInProgress(appId);
    try {
      const supabase = createClient();
      const app = type === 'filmmaker'
        ? filmmakerApps.find(a => a.id === appId)
        : distributorApps.find(a => a.id === appId);

      const table = type === 'filmmaker' ? 'filmmaker_applications' : 'distributor_applications';

      const { error } = await supabase
        .from(table)
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejected_by: 'admin',
        })
        .eq('id', appId);

      if (!error) {
        // Send rejection email
        await fetch('/api/admin/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: app.email,
            type,
            status: 'rejected',
          }),
        });

        fetchApplications();
      }
    } finally {
      setApprovalInProgress(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <span className="text-xl font-bold">Quiflix Admin</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Applications Review</h1>
          <p className="text-muted-foreground">Manage and approve/reject applications</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('filmmaker')}
            className={`px-4 py-2 font-semibold text-sm ${
              activeTab === 'filmmaker'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Filmmakers ({filmmakerApps.length})
          </button>
          <button
            onClick={() => setActiveTab('distributor')}
            className={`px-4 py-2 font-semibold text-sm ${
              activeTab === 'distributor'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Distributors ({distributorApps.length})
          </button>
        </div>

        {/* Filmmaker Applications */}
        {activeTab === 'filmmaker' && (
          <div className="space-y-4">
            {filmmakerApps.length === 0 ? (
              <Card className="bg-card border-border p-8 text-center">
                <p className="text-muted-foreground">No filmmaker applications</p>
              </Card>
            ) : (
              filmmakerApps.map((app) => (
                <Card key={app.id} className="bg-card border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{app.film_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.first_name} {app.last_name} • {app.email}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        app.status === 'approved'
                          ? 'bg-green-900/20 text-green-200'
                          : app.status === 'rejected'
                            ? 'bg-red-900/20 text-red-200'
                            : 'bg-yellow-900/20 text-yellow-200'
                      }`}
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Genre</p>
                      <p className="font-medium">{app.genre}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{app.duration_minutes} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Language</p>
                      <p className="font-medium">{app.language}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Year</p>
                      <p className="font-medium">{app.release_year}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-4">{app.film_description}</p>

                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(app.id, 'filmmaker')}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(app.id, 'filmmaker')}
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Distributor Applications */}
        {activeTab === 'distributor' && (
          <div className="space-y-4">
            {distributorApps.length === 0 ? (
              <Card className="bg-card border-border p-8 text-center">
                <p className="text-muted-foreground">No distributor applications</p>
              </Card>
            ) : (
              distributorApps.map((app) => (
                <Card key={app.id} className="bg-card border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{app.company_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {app.first_name} {app.last_name} • {app.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-2 ${
                          app.status === 'approved'
                            ? 'bg-green-900/20 text-green-200'
                            : app.status === 'rejected'
                              ? 'bg-red-900/20 text-red-200'
                              : 'bg-yellow-900/20 text-yellow-200'
                        }`}
                      >
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                      {app.status === 'approved' && (
                        <p className="text-sm text-primary font-semibold">
                          {app.ddt_tokens} DDTs
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Country</p>
                      <p className="font-medium">{app.country}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Years in Business</p>
                      <p className="font-medium">{app.years_in_business}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium">{app.phone}</p>
                    </div>
                  </div>

                  <div className="mb-4 text-sm">
                    <p className="text-muted-foreground mb-1">Distribution Channels</p>
                    <p>{app.distribution_channels}</p>
                  </div>

                  <div className="mb-4 text-sm">
                    <p className="text-muted-foreground mb-1">Target Markets</p>
                    <p>{app.target_markets}</p>
                  </div>

                  <div className="mb-4 text-sm">
                    <p className="text-muted-foreground mb-1">Experience</p>
                    <p>{app.experience_description}</p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Select Film for DDT Assignment
                        </label>
                        <select
                          value={selectedFilmForDDT}
                          onChange={(e) => setSelectedFilmForDDT(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm"
                        >
                          <option value="">Choose a film...</option>
                          {films.map((film) => (
                            <option key={film.id} value={film.id}>
                              {film.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(app.id, 'distributor')}
                          disabled={!selectedFilmForDDT || approvalInProgress === app.id}
                          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                          {approvalInProgress === app.id ? 'Processing...' : 'Approve + Assign DDT'}
                        </Button>
                        <Button
                          onClick={() => handleReject(app.id, 'distributor')}
                          disabled={approvalInProgress === app.id}
                          variant="outline"
                          className="flex-1 bg-transparent"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
