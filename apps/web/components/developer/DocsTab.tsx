'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Code,
  ExternalLink,
  Zap,
  Car,
  Search,
  Terminal
} from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/get-car-prices',
    description: 'Fetch the latest car prices from various Egyptian sources.',
    icon: Car,
  },
  {
    method: 'GET',
    path: '/autocomplete',
    description: 'Get search suggestions for car makes, models, and years.',
    icon: Search,
  },
];

export function DocsTab() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-white">Documentation</h1>
        <p className="text-zinc-400 mt-1">
          Learn how to integrate with the Open Egypt API
        </p>
      </div>

      {/* Quick Start */}
      <Card className="glass border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription className="text-zinc-400">Get up and running in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-black/50 border border-zinc-800 font-mono text-sm overflow-x-auto">
            <pre className="text-zinc-300">
{`curl -X GET "https://api.openegy.com/v1/get-car-prices" \
  -H "Authorization: Bearer YOUR_API_KEY"`}
            </pre>
          </div>
          <p className="text-sm text-zinc-400">
            Replace <code className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-xs text-zinc-300">YOUR_API_KEY</code> with 
            the API key from your dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card className="glass border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Code className="w-5 h-5 text-primary" />
            Available Endpoints
          </CardTitle>
          <CardDescription className="text-zinc-400">Core API endpoints for your integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <endpoint.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono border-zinc-700 text-zinc-400">
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-zinc-200">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {endpoint.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="glass border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Terminal className="w-5 h-5 text-primary" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://github.com/Moe1211/open-egypt" 
              target="_blank"
              className="flex items-center gap-3 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">GitHub Repository</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-zinc-400">Explore the source code</p>
              </div>
            </a>
            
            <a 
              href="#" 
              className="flex items-center gap-3 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-200">API Documentation</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-zinc-400">Full Postman collection</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}