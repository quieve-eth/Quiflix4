'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Send, ArrowUpRight, ArrowDownLeft, Copy, ExternalLink } from 'lucide-react';

interface WalletData {
  wallet_address: string;
  balance_usdc: number;
  balance_usdt: number;
  balance_kes: number;
  user_type: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount_usd: number;
  stablecoin_type: string;
  status: string;
  created_at: string;
  blockchain_tx_hash?: string;
}

export default function WalletDashboard() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch('/api/wallet/info');
        if (response.ok) {
          const data = await response.json();
          setWallet(data);
        }

        const txResponse = await fetch('/api/wallet/transactions');
        if (txResponse.ok) {
          const txData = await txResponse.json();
          setTransactions(txData.transactions || []);
        }
      } catch (error) {
        console.error('[v0] Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const copyAddress = () => {
    if (wallet?.wallet_address) {
      navigator.clipboard.writeText(wallet.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const totalValue = (wallet?.balance_usdc || 0) + (wallet?.balance_usdt || 0);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Wallet Dashboard</h1>
          <p className="text-muted-foreground">Manage your stablecoin earnings and transactions</p>
        </div>

        {/* Wallet Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-2">Total Value</p>
                <h2 className="text-4xl font-bold">${totalValue.toFixed(2)}</h2>
                <p className="text-xs text-muted-foreground mt-2">USD</p>
              </div>
              <Wallet className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <p className="text-muted-foreground text-sm mb-2">USDC Balance</p>
            <h3 className="text-3xl font-bold mb-3">{(wallet?.balance_usdc || 0).toFixed(2)}</h3>
            <Button size="sm" variant="outline" className="w-full bg-transparent text-xs">
              Send
            </Button>
          </Card>

          <Card className="bg-card border-border p-6">
            <p className="text-muted-foreground text-sm mb-2">USDT Balance</p>
            <h3 className="text-3xl font-bold mb-3">{(wallet?.balance_usdt || 0).toFixed(2)}</h3>
            <Button size="sm" variant="outline" className="w-full bg-transparent text-xs">
              Send
            </Button>
          </Card>
        </div>

        {/* Wallet Address */}
        <Card className="bg-card border-border p-6 mb-8">
          <h3 className="text-lg font-bold mb-4">Wallet Address</h3>
          <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
            <code className="flex-1 text-sm font-mono text-muted-foreground break-all">
              {wallet?.wallet_address}
            </code>
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-card rounded transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4" />
            </button>
            <a
              href={`https://basescan.org/address/${wallet?.wallet_address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-card rounded transition-colors"
              title="View on Basescan"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          {copied && <p className="text-sm text-green-500 mt-2">Address copied!</p>}
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" size="lg">
            <ArrowDownLeft className="w-5 h-5" />
            Receive Funds
          </Button>
          <Button variant="outline" className="bg-transparent gap-2" size="lg">
            <ArrowUpRight className="w-5 h-5" />
            Send Payment
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-bold mb-6">Recent Transactions</h3>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      tx.transaction_type === 'purchase'
                        ? 'bg-red-500/20'
                        : 'bg-green-500/20'
                    }`}>
                      {tx.transaction_type === 'purchase' ? (
                        <ArrowUpRight className="w-5 h-5 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {tx.transaction_type === 'purchase' ? '-' : '+'}
                      {tx.amount_usd.toFixed(2)} {tx.stablecoin_type}
                    </p>
                    <p className={`text-xs ${
                      tx.status === 'completed'
                        ? 'text-green-500'
                        : tx.status === 'pending'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
