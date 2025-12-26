'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/developer/DashboardLayout'
import { OverviewTab } from '@/components/developer/OverviewTab'
import { ApiKeysTab } from '@/components/developer/ApiKeysTab'
import { DocsTab } from '@/components/developer/DocsTab'
import { SettingsTab } from '@/components/developer/SettingsTab'
import { OnboardingWizard } from '@/components/developer/OnboardingWizard'
import { UpgradeModal } from '@/components/developer/UpgradeModal'
import { toast } from 'sonner'
import { Partner, ApiKey } from '@/types/partner'

export default function DeveloperPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Auth Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    if (session?.user) {
      fetchPartnerData(session.user.id)
    } else {
      setLoading(false)
    }
  }

  const fetchPartnerData = async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*, api_keys(*)')
        .eq('owner_user_id', userId)
        .maybeSingle()
      
      if (data) {
        setPartner(data as Partner)
        setKeys((data.api_keys || []) as ApiKey[])
      } else {
        setPartner(null)
      }
    } catch (err: any) {
      console.error('Error fetching partner data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) toast.error(error.message)
      else toast.success('Check your email for confirmation!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) toast.error(error.message)
      else checkSession()
    }
    setLoading(false)
  }

  const generateKey = async () => {
    if (!partner) return
    
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          partnerId: partner.id,
          tier: partner.tier === 'partner' ? 'partner' : 'free',
          name: 'New Key'
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      await fetchPartnerData(user!.id)
      return json.apiKey
    } catch (err: any) {
      toast.error('Failed to generate key: ' + err.message)
      throw err
    }
  }

  const revokeKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_revoked: true })
        .eq('id', keyId)

      if (error) throw error
      await fetchPartnerData(user!.id)
    } catch (err: any) {
      toast.error('Failed to revoke key: ' + err.message)
      throw err
    }
  }

  const updatePartner = async (updates: Partial<Partner>) => {
    if (!partner) return
    try {
      const { error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', partner.id)

      if (error) throw error
      toast.success('Partner updated successfully')
      await fetchPartnerData(user!.id)
    } catch (err: any) {
      toast.error('Failed to update partner: ' + err.message)
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    )
  }

  // Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md bg-zinc-900/50 p-8 rounded-xl border border-zinc-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Developer Portal</h1>
            <p className="text-sm text-zinc-400 mt-2">Sign in to manage your API keys.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Email</label>
              <input 
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white transition-all" 
                type="email" 
                value={email} onChange={e => setEmail(e.target.value)} 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase mb-1">Password</label>
              <input 
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-white transition-all" 
                type="password" 
                value={password} onChange={e => setPassword(e.target.value)} 
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-white text-black py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-sm text-zinc-500 hover:text-white transition-colors"
            >
              {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!partner && !loading) {
    return (
      <OnboardingWizard 
        onComplete={() => {
          fetchPartnerData(user.id)
        }} 
      />
    )
  }

  if (!partner) return null

  return (
    <DashboardLayout 
      partner={partner} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'overview' && (
        <OverviewTab 
          partner={partner} 
          activeKeyCount={keys.filter(k => !k.is_revoked).length}
          onUpgrade={() => setShowUpgradeModal(true)}
          keyIds={keys.map(k => k.id)}
        />
      )}
      {activeTab === 'keys' && (
        <ApiKeysTab 
          apiKeys={keys} 
          onGenerateKey={generateKey}
          onRevokeKey={revokeKey}
        />
      )}
      {activeTab === 'docs' && <DocsTab />}
      {activeTab === 'settings' && (
        <SettingsTab 
          partner={partner} 
          onUpdatePartner={updatePartner}
          onResetData={async () => {
             if (confirm('Are you sure you want to reset your partner account? This cannot be undone.')) {
               const { error } = await supabase.from('partners').delete().eq('id', partner.id)
               if (error) toast.error(error.message)
               else {
                 setPartner(null)
                 setKeys([])
               }
             }
          }}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal 
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
          partner={partner}
          onUpdatePartner={updatePartner}
        />
      )}
    </DashboardLayout>
  )
}
