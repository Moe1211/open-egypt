'use client'

import { useState, useEffect } from 'react'

type PriceEntry = {
  id: string;
  price_amount: number;
  year_model: number;
  valid_from: string;
  variant: {
    name_en: string;
    model: {
      name_en: string;
      brand: {
        name_en: string;
      }
    }
  }
}

type DropdownItem = { id: string; name_en: string }

export default function PartnerClient() {
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [partnerName, setPartnerName] = useState('')
  const [data, setData] = useState<PriceEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<string>('')

  // Add Listing State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [brands, setBrands] = useState<DropdownItem[]>([])
  const [models, setModels] = useState<DropdownItem[]>([])
  const [variants, setVariants] = useState<DropdownItem[]>([])
  
  const [newListing, setNewListing] = useState({
    brandId: '',
    modelId: '',
    variantId: '',
    year: new Date().getFullYear().toString(),
    price: ''
  })

  // -- Persistence --
  useEffect(() => {
    const storedKey = localStorage.getItem('open_egypt_partner_key')
    if (storedKey) {
      setApiKey(storedKey)
      handleLogin(storedKey)
    }
  }, [])

  // -- API Helpers --

  const apiCall = async (method: 'GET' | 'POST', body?: any, keyOverride?: string) => {
    const key = keyOverride || apiKey
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/partner-portal`, {
      method,
      headers: {
        'x-partner-key': key,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request Failed' }))
      throw new Error(err.error || 'Request Failed')
    }
    return res.json()
  }

  const handleLogin = async (keyOverride?: string) => {
    const keyToUse = keyOverride || apiKey
    if (!keyToUse) return

    setLoading(true)
    setError('')
    try {
      const json = await apiCall('GET', undefined, keyToUse)
      setPartnerName(json.partner.name)
      setData(json.data)
      setIsAuthenticated(true)
      localStorage.setItem('open_egypt_partner_key', keyToUse)
    } catch (err: any) {
      setError(err.message)
      if (err.message === 'Invalid or revoked API Key') {
        localStorage.removeItem('open_egypt_partner_key')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setApiKey('')
    setPartnerName('')
    setData([])
    localStorage.removeItem('open_egypt_partner_key')
  }

  // -- Add Listing Logic --

  const openAddModal = async () => {
    setIsAddModalOpen(true)
    // Fetch Brands
    try {
      const res = await apiCall('POST', { action: 'get_metadata', payload: { type: 'brands' } })
      setBrands(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleBrandChange = async (brandId: string) => {
    setNewListing({ ...newListing, brandId, modelId: '', variantId: '' })
    setModels([])
    setVariants([])
    if (!brandId) return
    const res = await apiCall('POST', { action: 'get_metadata', payload: { type: 'models', filter_id: brandId } })
    setModels(res.data)
  }

  const handleModelChange = async (modelId: string) => {
    setNewListing({ ...newListing, modelId, variantId: '' })
    setVariants([])
    if (!modelId) return
    const res = await apiCall('POST', { action: 'get_metadata', payload: { type: 'variants', filter_id: modelId } })
    setVariants(res.data)
  }

  const handleSubmitListing = async () => {
    if (!newListing.variantId || !newListing.price || !newListing.year) return
    setLoading(true)
    try {
      await apiCall('POST', {
        action: 'create_listing',
        payload: {
          variant_id: newListing.variantId,
          year_model: parseInt(newListing.year),
          price_amount: parseFloat(newListing.price)
        }
      })
      
      setIsAddModalOpen(false)
      setNewListing({ brandId: '', modelId: '', variantId: '', year: new Date().getFullYear().toString(), price: '' })
      await handleLogin() // Refresh data
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // -- Update Logic --

  const handleUpdatePrice = async (id: string) => {
    if (!editPrice) return
    setLoading(true)
    try {
      await apiCall('POST', {
        action: 'update_price',
        payload: { id, new_price: parseFloat(editPrice) }
      })
      await handleLogin()
      setEditingId(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // -- Render --

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Partner Portal</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>Enter your API Key to manage your inventory.</p>
        <input 
          type="password" 
          value={apiKey} 
          onChange={e => setApiKey(e.target.value)}
          placeholder="sk_live_..."
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        <button 
          onClick={() => handleLogin()}
          disabled={loading}
          style={{ width: '100%', padding: '0.8rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Authenticating...' : 'Access Portal'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{partnerName} Dashboard</h1>
          <p style={{ color: '#666' }}>Managing {data.length} listings</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={openAddModal}
            style={{ padding: '0.6rem 1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
          >
            + Add Listing
          </button>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {/* Data Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '1rem' }}>Brand</th>
              <th style={{ padding: '1rem' }}>Model</th>
              <th style={{ padding: '1rem' }}>Variant</th>
              <th style={{ padding: '1rem' }}>Year</th>
              <th style={{ padding: '1rem' }}>Price (EGP)</th>
              <th style={{ padding: '1rem' }}>Last Updated</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{row.variant.model.brand.name_en}</td>
                <td style={{ padding: '1rem' }}>{row.variant.model.name_en}</td>
                <td style={{ padding: '1rem' }}>{row.variant.name_en}</td>
                <td style={{ padding: '1rem' }}>{row.year_model}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                  {editingId === row.id ? (
                    <input 
                      type="number" 
                      value={editPrice} 
                      onChange={e => setEditPrice(e.target.value)}
                      style={{ padding: '0.4rem', width: '100px' }}
                    />
                  ) : (
                    new Intl.NumberFormat('en-EG').format(row.price_amount)
                  )}
                </td>
                <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
                  {new Date(row.valid_from).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  {editingId === row.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleUpdatePrice(row.id)} disabled={loading} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setEditingId(row.id)
                        setEditPrice(row.price_amount.toString())
                      }}
                      style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Listing Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>Add New Listing</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Brand</label>
              <select 
                style={{ width: '100%', padding: '0.5rem' }} 
                value={newListing.brandId}
                onChange={(e) => handleBrandChange(e.target.value)}
              >
                <option value="">Select Brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name_en}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model</label>
              <select 
                style={{ width: '100%', padding: '0.5rem' }}
                value={newListing.modelId}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={!newListing.brandId}
              >
                <option value="">Select Model...</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name_en}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Variant</label>
              <select 
                style={{ width: '100%', padding: '0.5rem' }}
                value={newListing.variantId}
                onChange={(e) => setNewListing({ ...newListing, variantId: e.target.value })}
                disabled={!newListing.modelId}
              >
                <option value="">Select Variant...</option>
                {variants.map(v => <option key={v.id} value={v.id}>{v.name_en}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Year</label>
                <input 
                  type="number" 
                  value={newListing.year}
                  onChange={(e) => setNewListing({ ...newListing, year: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price (EGP)</label>
                <input 
                  type="number" 
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem' }}
                  placeholder="e.g. 5000000"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitListing}
                disabled={loading || !newListing.variantId || !newListing.price}
                style={{ padding: '0.6rem 1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                {loading ? 'Adding...' : 'Add Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
