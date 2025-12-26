'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Pyramid, Sparkles, Loader2, CheckCircle, Copy, Code } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && name.trim().length >= 3) {
      setStep(2);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('No user session found');

      // 1. Create Partner
      const slug = generateSlug(name);
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .insert({
          name: name,
          slug: slug,
          owner_user_id: user.id,
          type: 'DEVELOPER',
          status: 'ACTIVE',
          contact_info: {
            use_case: useCase,
            onboarded_via: 'lovable_wizard_v1'
          }
        })
        .select()
        .single();

      if (partnerError) throw partnerError;

      // 2. Generate Key
      const token = session?.access_token;
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partnerId: partner.id,
          tier: 'free',
          name: 'Default Key'
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate key');

      setApiKey(json.apiKey);
      setStep(3);
      toast.success('Account set up successfully!');
    } catch (err: any) {
      toast.error('Onboarding failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-lg glass-strong animate-scale-in relative z-10 border-zinc-800 bg-zinc-900/50">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg animate-glow">
            <Pyramid className="w-8 h-8 text-black" />
          </div>
          <CardTitle className="text-2xl font-semibold text-white">
            Welcome to <span className="text-gradient">Open Egypt</span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {step === 3 ? "You're all set up!" : "Set up your developer account in seconds"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Step indicators */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-zinc-800'}`} />
              <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-zinc-800'}`} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Application Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Car Price Tracker"
                  className="h-12 bg-zinc-950 border-zinc-800 focus:border-primary transition-colors text-white"
                  autoFocus
                />
                <p className="text-xs text-zinc-500">
                  Choose a name for your API integration.
                </p>
              </div>
              
              <Button 
                onClick={handleNext}
                disabled={name.trim().length < 3}
                className="w-full h-12 gradient-primary text-black font-bold group"
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  What are you building?
                </label>
                <Textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="I'm building an app that helps tourists discover Egyptian historical sites..."
                  className="min-h-[120px] bg-zinc-950 border-zinc-800 focus:border-primary transition-colors resize-none text-white"
                />
                <p className="text-xs text-zinc-500">
                  This helps us understand your needs.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-12 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Back
                </Button>
                <Button 
                  onClick={finishOnboarding}
                  disabled={!useCase.trim() || loading}
                  className="flex-1 h-12 gradient-primary text-black font-bold group"
                >
                  {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <Sparkles className="mr-2 w-4 h-4" />}
                  Get Started
                </Button>
              </div>
            </div>
          )}

          {step === 3 && apiKey && (
            <div className="space-y-6 animate-fade-up">
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 relative group">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Your First API Key</label>
                <div className="flex items-center gap-2">
                   <code className="text-primary font-mono text-sm break-all block flex-1">
                    {apiKey}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => copyToClipboard(apiKey)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Code size={16} /> Quick Start
                </h4>
                <div className="bg-black/50 border border-zinc-800 p-3 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-zinc-400 font-mono">
{`curl -X GET "https://api.openegy.com/v1/get-car-prices" \
  -H "x-api-key:${apiKey}"`}
                  </pre>
                </div>
              </div>

              <Button 
                onClick={onComplete}
                className="w-full h-12 bg-white text-black font-bold hover:bg-zinc-200"
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}