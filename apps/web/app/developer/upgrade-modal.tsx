'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Loader2, CheckCircle, Wallet, MessageSquare, ShieldCheck, ArrowRight, X } from 'lucide-react'

type UpgradeModalProps = {
  partner: any
  onClose: () => void
}

export default function UpgradeModal({ partner, onClose }: UpgradeModalProps) {
  const [step, setStep] = useState(1) // 1: Form, 2: Payment
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    billingEmail: ''
  })

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error: pError } = await supabase
        .from('partners')
        .update({
          billing_email: formData.billingEmail,
          subscription_status: 'verification_pending',
          kyc_data: {
            business_name: formData.businessName,
            website: formData.website
          }
        })
        .eq('id', partner.id)

      if (pError) throw pError

      await supabase.functions.invoke('telegram-bot', {
        body: {
          action: 'notify_upgrade_request',
          partnerName: partner.name,
          partnerId: partner.id,
          kycData: {
            business_name: formData.businessName,
            website: formData.website
          }
        }
      })

      setStep(2)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-zinc-950 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-800">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {step === 1 ? 'Upgrade to Partner' : 'Complete Payment'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {step === 1 ? 'Step 1 of 2: Business Verification' : 'Step 2 of 2: Transfer Funds'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {step === 1 && (
          <div className="p-8">
            <div className="flex gap-4 mb-6 bg-zinc-900 border border-zinc-800 p-4 rounded-lg text-zinc-300 text-sm">
              <ShieldCheck className="shrink-0 text-indigo-400" size={20} />
              <p>We need a few details to verify your business before enabling higher rate limits.</p>
            </div>
            
            <form onSubmit={handleSubmitKYC} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Business Name</label>
                <input 
                  required
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Nile Motors App"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Website (Optional)</label>
                <input 
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1.5">Billing Email</label>
                <input 
                  required
                  type="email"
                  className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                  value={formData.billingEmail}
                  onChange={e => setFormData({ ...formData, billingEmail: e.target.value })}
                  placeholder="billing@company.com"
                />
              </div>

              <div className="pt-4">
                <button 
                  disabled={loading}
                  className="w-full py-3 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <>Continue <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-zinc-900 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                <Wallet size={24} />
              </div>
              <h3 className="text-base font-semibold text-white">Send Payment</h3>
              <p className="text-zinc-500 text-sm mt-1">
                Transfer <span className="font-bold text-white">500 EGP</span> via Vodafone Cash or Instapay.
              </p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-dashed border-zinc-700 mb-6 text-center hover:border-indigo-500/50 transition-colors">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Wallet Number</p>
              <p className="text-2xl font-mono font-bold text-white tracking-wider">0100 000 0000</p>
            </div>

            <div className="bg-indigo-900/20 p-4 rounded-lg flex gap-3 mb-8 border border-indigo-500/20">
              <MessageSquare className="text-indigo-400 shrink-0" size={20} />
              <div className="text-sm text-indigo-200 space-y-1">
                <p className="font-semibold text-indigo-100">Verification Step:</p>
                <p>
                  Send a receipt screenshot to our Telegram Bot with your ID: 
                </p>
                <code className="inline-block bg-black/50 px-2 py-0.5 rounded border border-indigo-500/30 font-mono text-indigo-300 font-bold mt-2 text-xs">
                  {partner.id.substring(0,8)}
                </code>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-3 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all text-sm"
            >
              I've sent the screenshot
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
