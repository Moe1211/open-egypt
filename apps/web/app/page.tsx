import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Github, Database, Cpu, Layout, BookOpen, Terminal } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-primary/20">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <header className="mb-20 text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              Open Egypt
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The "Shadow" Open Data Infrastructure for Egypt.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/prices">
                Search Car Prices <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://github.com/Moe1211/open-egypt" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 w-4 h-4" /> View on GitHub
              </a>
            </Button>
          </div>
        </header>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {/* Module: Car Prices */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🚗</span> Car Prices API
              </CardTitle>
              <CardDescription className="text-base">
                A public, transparent API for automotive pricing in Egypt. Aggregated from major market sources.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Real-time market data
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Historical price tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Brand & Model aggregation
                </li>
              </ul>
              <div className="pt-2">
                 <code className="bg-muted px-3 py-1.5 rounded-md text-sm font-mono block w-fit">
                   GET /functions/v1/get-car-prices
                 </code>
              </div>
            </CardContent>
          </Card>

          {/* Module: Architecture */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🏗️</span> Architecture
              </CardTitle>
              <CardDescription className="text-base">
                Built on a "Supabase Native" stack to ensure zero maintenance and infinite scalability.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                  <Database className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <strong className="block text-sm">Database</strong>
                    <span className="text-muted-foreground text-sm">PostgreSQL (Open Egypt Schema)</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                  <Cpu className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block text-sm">Logic</strong>
                    <span className="text-muted-foreground text-sm">Edge Functions (Deno)</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                  <Layout className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <strong className="block text-sm">Frontend</strong>
                    <span className="text-muted-foreground text-sm">Next.js App Router</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documentation Section */}
        <section className="space-y-12 border-t pt-20">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <h2 className="text-3xl font-bold">Documentation</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                Project Philosophy
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                "If the data doesn't exist, we build it." Open Egypt is an initiative to digitize the missing public infrastructure. 
                We do not wait for official APIs. We scrape, aggregate, and normalize data into a public good.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                For Developers
              </h3>
              <p className="text-muted-foreground">
                This project enforces strict <span className="text-foreground font-medium">Zero Technical Debt</span> policies.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-muted-foreground text-sm">
                  <Badge variant="outline" className="mt-0.5">Monorepo</Badge>
                  <span>Managed with PNPM Workspaces.</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground text-sm">
                  <Badge variant="outline" className="mt-0.5">Type Safety</Badge>
                  <span>100% TypeScript. Shared types between DB and Web.</span>
                </li>
                <li className="flex items-start gap-2 text-muted-foreground text-sm">
                  <Badge variant="outline" className="mt-0.5">Migrations</Badge>
                  <span>Manual SQL review process. No automatic schema drifts.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t text-center text-muted-foreground text-sm">
          <p>© 2025 Open Egypt Initiative. Open Source.</p>
        </footer>
      </div>
    </div>
  )
}
