'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Partner } from '@/types/partner';
import { 
  Sparkles, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  Copy,
  Send,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner;
  onUpdatePartner: (updates: Partial<Partner>) => Promise<void>;
}

type Step = 'kyc' | 'payment' | 'confirm';

export function UpgradeModal({ open, onOpenChange, partner, onUpdatePartner }: UpgradeModalProps) {
  const [step, setStep] = useState<Step>('kyc');
  const [businessName, setBusinessName] = useState(partner.kyc_data?.business_name || '');
  const [website, setWebsite] = useState(partner.kyc_data?.website || '');
  const [billingEmail, setBillingEmail] = useState(partner.kyc_data?.billing_email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKycSubmit = async () => {
    if (!businessName.trim() || !billingEmail.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUpdatePartner({
        kyc_data: {
          business_name: businessName.trim(),
          website: website.trim(),
          billing_email: billingEmail.trim(),
        }
      });
      setStep('payment');
    } catch (error) {
      toast.error('Failed to save info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onUpdatePartner({
        subscription_status: 'verification_pending',
      });
      setStep('confirm');
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset step after close animation
    setTimeout(() => setStep('kyc'), 300);
  };

  const stepIndicators = [
    { key: 'kyc', label: 'Business Info' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirm', label: 'Confirm' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-primary" />
            Upgrade to Partner
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Get higher rate limits, priority support, and more
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-6">
          {stepIndicators.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex items-center gap-2 ${
                step === s.key ? 'text-primary' : 
                stepIndicators.findIndex(x => x.key === step) > i ? 'text-success' : 'text-zinc-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s.key ? 'bg-primary text-black' :
                  stepIndicators.findIndex(x => x.key === step) > i ? 'bg-success text-white' : 'bg-zinc-800'
                }`}>
                  {stepIndicators.findIndex(x => x.key === step) > i ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs hidden sm:inline font-medium">{s.label}</span>
              </div>
              {i < stepIndicators.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-2 text-zinc-800" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {step === 'kyc' && (
          <div className="space-y-4 animate-fade-up">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-zinc-300">Business Name *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Company Ltd"
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="text-zinc-300">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingEmail" className="text-zinc-300">Billing Email *</Label>
              <Input
                id="billingEmail"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@yoursite.com"
                className="bg-zinc-950 border-zinc-800 text-white"
              />
            </div>

            <Button onClick={handleKycSubmit} disabled={isSubmitting} className="w-full gradient-primary text-black font-bold">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Continue to Payment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4 animate-fade-up">
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Payment Options
              </h4>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-200">Vodafone Cash</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard('01012345678')}
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <code className="text-sm text-primary font-mono">01012345678</code>
                </div>
                
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-200">InstaPay</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard('openegypt@instapay')}
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <code className="text-sm text-primary font-mono">openegypt@instapay</code>
                </div>
              </div>

              <p className="text-xs text-zinc-500 mt-3">
                Send payment of <span className="font-bold text-zinc-300">500 EGP/month</span> to either option above.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('kyc')} className="flex-1 border-zinc-800 text-zinc-300">
                Back
              </Button>
              <Button 
                onClick={handlePaymentConfirm} 
                disabled={isSubmitting}
                className="flex-1 gradient-primary text-black font-bold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                I have sent payment
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="text-center py-6 animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Request Submitted!
            </h3>
            <p className="text-zinc-400 mb-6 text-sm">
              We'll verify your payment and upgrade your account within 24 hours.
              You'll receive an email at <span className="font-medium text-zinc-200">{billingEmail}</span>.
            </p>
            <Button onClick={handleClose} className="w-full bg-white text-black font-bold hover:bg-zinc-200">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}