'use client';

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrendingUp, Film, Users, DollarSign, Play, Plus, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        redirect('/auth/login')
      }
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  if (loading) {
    return <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Quiflix</h1>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Films</a>
            <a href="#" className="hover:text-foreground">Campaigns</a>
            <a href="#" className="hover:text-foreground">Earnings</a>
            <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Films</h2>
          <p className="text-muted-foreground">Manage campaigns, track sales, maximize revenue</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold">2</p>
              </div>
              <Play className="h-5 w-5 text-primary" />
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Sales</p>
                <p className="text-3xl font-bold">12.4K</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Distributors</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </Card>
          
          <Card className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Earnings</p>
                <p className="text-3xl font-bold">$8.6K</p>
              </div>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </Card>
        </div>

        {/* Films Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Films</h3>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Film
            </Button>
          </div>

          <div className="space-y-3">
            {/* Film 1 */}
            <Card className="bg-card border-border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Shadow of the Sun</h4>
                  <p className="text-sm text-muted-foreground mb-3">Nigeria | Drama | Ready for distribution</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Sales: <span className="text-foreground font-semibold">8.2K</span></span>
                    <span className="text-muted-foreground">Earned: <span className="text-foreground font-semibold">$5.7K</span></span>
                    <span className="text-muted-foreground">Days Left: <span className="text-foreground font-semibold">67</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </Card>

            {/* Film 2 */}
            <Card className="bg-card border-border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Urban Hearts</h4>
                  <p className="text-sm text-muted-foreground mb-3">Kenya | Romance | Active campaign</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Sales: <span className="text-foreground font-semibold">4.2K</span></span>
                    <span className="text-muted-foreground">Earned: <span className="text-foreground font-semibold">$2.9K</span></span>
                    <span className="text-muted-foreground">Days Left: <span className="text-foreground font-semibold">128</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            </Card>

            {/* Film 3 - Archived */}
            <Card className="bg-card border-border p-4 opacity-60">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Echoes</h4>
                  <p className="text-sm text-muted-foreground mb-3">South Africa | Thriller | Completed</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Total Sales: <span className="text-foreground font-semibold">3.1K</span></span>
                    <span className="text-muted-foreground">Final Earnings: <span className="text-foreground font-semibold">$2.2K</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Archive</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Distributors Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Top Distributors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Ama Okonkwo', sales: '3.2K', tokens: '2' },
              { name: 'Jamal Hassan', sales: '2.8K', tokens: '2' },
              { name: 'Zoe Banda', sales: '2.1K', tokens: '1' },
            ].map((distributor) => (
              <Card key={distributor.name} className="bg-card border-border p-4">
                <h4 className="font-semibold mb-2">{distributor.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sales:</span>
                    <span className="text-foreground font-semibold">{distributor.sales}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tokens Earned:</span>
                    <span className="text-foreground font-semibold">{distributor.tokens}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border pt-8">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button size="lg" className="w-full gap-2">
              <Plus className="h-5 w-5" />
              Launch New Campaign
            </Button>
            <Button size="lg" variant="outline" className="w-full gap-2 bg-transparent">
              <Users className="h-5 w-5" />
              Review Distributor Applications
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
