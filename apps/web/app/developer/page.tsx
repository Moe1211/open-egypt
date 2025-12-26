'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'
import { Key, Shield, AlertCircle, CheckCircle, Copy, Plus } from 'lucide-react'

export default function DeveloperPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [partner, setPartner] = useState<any>(null)
  const [keys, setKeys] = useState<any[]>([])
  const [newKey, setNewKey] = useState<string | null>(null)
  
  // Auth Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  // Partner Form State
  const [partnerName, setPartnerName] = useState('')
  const [slug, setSlug] = useState('')

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
    const { data, error } = await supabase
      .from('partners')
      .select('*, api_keys(*)')
      .eq('owner_user_id', userId)
      .single()
    
    if (data) {
      setPartner(data)
      setKeys(data.api_keys || [])
    }
    setLoading(false)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert('Check your email for confirmation!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else checkSession()
    }
    setLoading(false)
  }

  const createPartner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('partners')
      .insert({
        name: partnerName,
        slug: slug,
        owner_user_id: user.id,
        type: 'DEVELOPER'
      })
      .select()
      .single()

    if (error) {
      alert('Error creating account: ' + error.message)
    } else {
      fetchPartnerData(user.id)
    }
    setLoading(false)
  }

  const generateKey = async () => {
    if (!partner) return
    setLoading(true)
    
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
          tier: 'free' // Default to free
        })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setNewKey(json.apiKey)
      if(user){
        fetchPartnerData(user.id) // Refresh list
      }
    } catch (err: any) {
      alert('Failed to generate key: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) return <div className="p-8">Loading...</div>

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Developer Portal</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input 
              className="w-full p-2 border rounded mt-1" 
              type="email" 
              value={email} onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input 
              className="w-full p-2 border rounded mt-1" 
              type="password" 
              value={password} onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button className="w-full bg-black text-white p-2 rounded">
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
            {authMode === 'login' ? 'Create an account' : 'Already have an account?'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <button 
          onClick={() => supabase.auth.signOut().then(() => setUser(null))}
          className="text-sm text-gray-500 hover:text-black"
        >
          Sign Out
        </button>
      </div>

      {!partner ? (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Create Developer Account</h2>
          <form onSubmit={createPartner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">App/Company Name</label>
              <input 
                className="w-full p-2 border rounded mt-1" 
                value={partnerName} onChange={e => setPartnerName(e.target.value)} 
                placeholder="My Awesome App"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Slug (ID)</label>
              <input 
                className="w-full p-2 border rounded mt-1" 
                value={slug} onChange={e => setSlug(e.target.value)} 
                placeholder="my-app"
              />
            </div>
            <button className="bg-black text-white px-4 py-2 rounded">Register</button>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Status Card */}
          <div className="p-6 border rounded-lg bg-white shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{partner.name}</h3>
              <p className="text-gray-500 text-sm">ID: {partner.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
              partner.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              partner.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {partner.status === 'ACTIVE' ? <CheckCircle size={16}/> : 
               partner.status === 'REJECTED' ? <AlertCircle size={16}/> : 
               <Shield size={16}/>}
              {partner.status}
            </div>
          </div>

          {/* New Key Modal */}
          {newKey && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <h3 className="text-green-800 font-bold mb-2">API Key Generated!</h3>
              <p className="text-sm text-green-700 mb-4">
                Copy this key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-3 rounded border font-mono text-sm break-all">
                  {newKey}
                </code>
                <button 
                  onClick={() => navigator.clipboard.writeText(newKey)}
                  className="p-2 hover:bg-green-100 rounded"
                >
                  <Copy size={20} className="text-green-700"/>
                </button>
              </div>
              <button 
                onClick={() => setNewKey(null)}
                className="mt-4 text-sm text-green-700 underline"
              >
                Close
              </button>
            </div>
          )}

          {/* Keys List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Key className="w-5 h-5"/> API Keys
              </h2>
              <button 
                onClick={generateKey}
                disabled={loading || partner.status !== 'ACTIVE'}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16}/> Generate Key
              </button>
            </div>
            
            {partner.status !== 'ACTIVE' && (
              <p className="text-sm text-yellow-600 mb-4">
                Your account is pending approval. You cannot generate keys yet.
              </p>
            )}

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Prefix</th>
                    <th className="px-6 py-3">Tier</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{key.name || 'Default'}</td>
                      <td className="px-6 py-4 font-mono">{key.prefix}••••••••</td>
                      <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{key.tier_id}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          key.is_revoked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {key.is_revoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No API keys found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
