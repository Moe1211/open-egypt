'use client'

import { useState, useEffect } from 'react'
import { searchCarPrices, CarPrice } from '../lib/api'

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CarPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Custom hook for debouncing (we'll implement this inline or in a separate file, 
  // but for simplicity here I'll just use a timeout effect)
  
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        // Search by model name mostly, or brand if typed
        const data = await searchCarPrices({ model: query, limit: 10 })
        setResults(data)
        setHasSearched(true)
      } finally {
        setLoading(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search car prices (e.g. 'Tiguan', 'Corolla')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        />
        {loading && (
          <div style={{ position: 'absolute', right: '1rem', top: '1.2rem', color: '#999' }}>
            Loading...
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {hasSearched && results.length === 0 && !loading && (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No prices found for "{query}".</p>
        )}

        {results.length > 0 && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((car) => (
              <div 
                key={car.id} 
                style={{ 
                  border: '1px solid #eee', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#fff'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {car.brand} {car.model} <span style={{color: '#666', fontWeight: 'normal'}}>({car.year})</span>
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                    {car.variant}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#2e7d32' }}>
                    {new Intl.NumberFormat('en-EG', { 
                      style: 'currency', 
                      currency: 'EGP',
                      maximumFractionDigits: 0 
                    }).format(car.price)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999' }}>
                    {new Date(car.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
