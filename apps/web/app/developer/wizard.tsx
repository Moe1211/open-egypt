'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { Rocket, Code, CheckCircle, ArrowRight, Loader2, Copy } from 'lucide-react'

type WizardProps = {
  user: User
  onComplete: () => void
}

export default function Wizard({ user, onComplete }: WizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form Data
  const [appName, setAppName] = useState('')
  const [useCase, setUseCase] = useState('mobile_app')
  
  // Result Data
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleNext = () => {
    if (step === 1 && appName.length > 2) setStep(2)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7)
  }

  const finishOnboarding = async () => {
    setLoading(true)
    try {
      // 1. Create Partner
      const slug = generateSlug(appName)
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .insert({
          name: appName,
          slug: slug,
          owner_user_id: user.id,
          type: 'DEVELOPER',
          status: 'ACTIVE', // Auto-activate for zero friction
          contact_info: {
            use_case: useCase,
            onboarded_via: 'wizard_v1'
          }
        })
        .select()
        .single()

      if (partnerError) throw partnerError

      // 2. Generate Key
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

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
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to generate key')

      setApiKey(json.apiKey)
      setStep(3)
    } catch (err: any) {
      alert('Onboarding failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Steps UI
  
  if (step === 1) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 mb-6 text-black">
          <div className="p-3 bg-black text-white rounded-lg">
            <Rocket size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome to Open Egypt</h2>
            <p className="text-gray-500">Let's get you set up in seconds.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">What are you building?</label>
            <input 
              autoFocus
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0 outline-none transition-all placeholder:text-gray-300"
              placeholder="e.g. Car Price Tracker"
              value={appName}
              onChange={e => setAppName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
            />
          </div>
          
          <button 
            onClick={handleNext}
            disabled={appName.length < 3}
            className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue <ArrowRight size={20} />
          </button>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold mb-6">How will you use the data?</h2>
        
        <div className="grid grid-cols-1 gap-3 mb-8">
          {[
            { id: 'mobile_app', label: 'Mobile Application', icon: '📱' },
            { id: 'website', label: 'Public Website', icon: '🌐' },
            { id: 'analysis', label: 'Data Analysis / Research', icon: '📊' },
            { id: 'personal', label: 'Personal Project', icon: '🏠' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setUseCase(opt.id)}
              className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${ 
                useCase === opt.id 
                  ? 'border-black bg-gray-50' 
                  : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="font-medium text-lg">{opt.label}</span>
            </button>
          ))}
        </div>

        <button 
          onClick={finishOnboarding}
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Get API Key'}
        </button>
      </div>
    )
  }

  if (step === 3 && apiKey) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2">You're In!</h2>
          <p className="text-gray-500">Here is your first API key. Keep it safe.</p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 relative group">
          <div className="absolute top-4 right-4">
            <button 
              onClick={copyKey}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
            </button>
          </div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Your API Key</label>
          <code className="text-green-400 font-mono text-xl break-all block pr-8">
            {apiKey}
          </code>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Code size={20} /> Quick Start
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-x-auto">
            <code className="text-sm font-mono text-gray-800 whitespace-pre">
{`curl -X GET '${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-car-prices' \
  -H 'x-api-key:${apiKey}'`}
            </code>
          </div>

          <button 
            onClick={onComplete}
            className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}
