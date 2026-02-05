'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Film, Play, Zap, TrendingUp, Users, Globe } from 'lucide-react';

export default function LandingPage() {
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
            <Link href="/films" className="text-sm hover:text-primary">
              Browse Films
            </Link>
            <Link href="/apply/filmmaker" className="text-sm hover:text-primary">
              For Filmmakers
            </Link>
            <Link href="/apply/distributor" className="text-sm hover:text-primary">
              For Distributors
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-background pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-6 py-24 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-border bg-card animate-slideDown">
              <Zap className="h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-sm">Film marketing reimagined</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight animate-slideUp">
              Distribute Your Films.
              <br />
              <span className="text-primary animate-glow">Globally. Instantly.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              Connect with distributors worldwide. Launch campaigns. Track earnings. All in one platform designed for filmmakers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <Link href="/films">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 transition-all hover:shadow-lg hover:shadow-primary/50">
                  Browse Films
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="outline" className="bg-transparent px-8 border-border hover:bg-card transition-all">
                  Get Started Free
                </Button>
              </Link>
            </div>

            <div className="mt-16 pt-16 border-t border-border flex items-center justify-center gap-8 text-sm text-muted-foreground animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Already used by 500+ filmmakers
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                2M+ films distributed
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Quiflix</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to get your films in front of the right audience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="bg-card border-border p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <Globe className="h-10 w-10 text-primary mb-4 animate-float" />
                <h3 className="text-xl font-bold mb-2">Global Network</h3>
                <p className="text-muted-foreground">Access distributors and platforms in 100+ countries</p>
              </Card>

              {/* Feature 2 */}
              <Card className="bg-card border-border p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <TrendingUp className="h-10 w-10 text-primary mb-4 animate-float" style={{ animationDelay: '0.5s' }} />
                <h3 className="text-xl font-bold mb-2">Real-Time Analytics</h3>
                <p className="text-muted-foreground">Track sales, earnings, and engagement instantly</p>
              </Card>

              {/* Feature 3 */}
              <Card className="bg-card border-border p-8 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <Zap className="h-10 w-10 text-primary mb-4 animate-pulse-glow" />
                <h3 className="text-xl font-bold mb-2">Fast Setup</h3>
                <p className="text-muted-foreground">Launch your first campaign in minutes, not weeks</p>
              </Card>
            </div>
          </div>
        </section>



        {/* Stats Section */}
        <section className="py-24 border-b border-border">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Active Filmmakers', value: '500+', delay: '0s' },
                { label: 'Films Distributed', value: '2M+', delay: '0.1s' },
                { label: 'Partner Platforms', value: '80+', delay: '0.2s' },
                { label: 'Avg Revenue/Film', value: '$12K', delay: '0.3s' },
              ].map((stat) => (
                <div key={stat.label} className="text-center animate-slideUp" style={{ animationDelay: stat.delay }}>
                  <p className="text-4xl md:text-5xl font-bold text-primary mb-2 animate-glow" style={{ animationDelay: stat.delay }}>{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of filmmakers and distributors already using Quiflix.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply/filmmaker">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Apply as Filmmaker
                </Button>
              </Link>
              <Link href="/apply/distributor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent px-8">
                  Apply as Distributor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 text-center text-muted-foreground text-sm">
        <p>© 2024 Quiflix. All rights reserved.</p>
      </footer>
    </div>
  );
}
