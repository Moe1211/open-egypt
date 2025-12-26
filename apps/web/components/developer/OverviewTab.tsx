'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Partner } from '@/types/partner';
import { 
  Activity, 
  Key, 
  Shield, 
  Copy, 
  ExternalLink,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import UsageChart from '@/app/developer/usage-chart';

interface OverviewTabProps {
  partner: Partner;
  activeKeyCount: number;
  onUpgrade: () => void;
  keyIds: string[];
}

export function OverviewTab({ partner, activeKeyCount, onUpgrade, keyIds }: OverviewTabProps) {
  const apiBaseUrl = 'https://api.openegy.com/v1/get-car-prices';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Overview</h1>
          <p className="text-zinc-400 mt-1">
            Monitor your API usage and manage your integration
          </p>
        </div>
        {partner.tier === 'free' && (
          <Button onClick={onUpgrade} className="gradient-primary text-black font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to Partner
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Current Tier</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={partner.tier === 'partner' 
                      ? 'gradient-primary border-0 text-black' 
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }
                  >
                    {partner.tier === 'partner' && <Sparkles className="w-3 h-3 mr-1" />}
                    {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    partner.status === 'ACTIVE' ? 'bg-success' : 
                    partner.status === 'PENDING' ? 'bg-warning' : 'bg-destructive'
                  }`} />
                  <span className="font-medium text-white">
                    {partner.status.charAt(0) + partner.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-zinc-800 bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500 font-medium">Active Keys</p>
                <p className="text-2xl font-semibold text-white mt-1">{activeKeyCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Key className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      <Card className="glass border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-primary" />
            API Requests
          </CardTitle>
          <CardDescription className="text-zinc-500">Your API usage over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <UsageChart keyIds={keyIds} />
          </div>
        </CardContent>
      </Card>

      {/* Integration Details */}
      <Card className="glass border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-white">Integration Details</CardTitle>
          <CardDescription className="text-zinc-500">Use these credentials to integrate with the Open Egypt API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Partner ID</label>
            <div className="flex gap-2">
              <Input 
                value={partner.id} 
                readOnly 
                className="font-mono text-sm bg-zinc-950 border-zinc-800 text-zinc-300"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(partner.id, 'Partner ID')}
                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">API Base URL</label>
            <div className="flex gap-2">
              <Input 
                value={apiBaseUrl} 
                readOnly 
                className="font-mono text-sm bg-zinc-950 border-zinc-800 text-zinc-300"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(apiBaseUrl, 'API Base URL')}
                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" asChild className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                <a href={apiBaseUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}