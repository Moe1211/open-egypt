'use client'

import { useState, useEffect, useRef } from 'react'
import { searchCarPrices, getSuggestions, CarPrice, Suggestion } from '../lib/api'

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [results, setResults] = useState<CarPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 1) {
        const data = await getSuggestions(query)
        setSuggestions(data)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery)
    setShowSuggestions(false)
    setLoading(true)
    try {
      const data = await searchCarPrices({ q: searchQuery, limit: 10 })
      setResults(data)
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search car prices (e.g. 'Tiguan', 'Corolla')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
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

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: '12px',
            marginTop: '0.5rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            zIndex: 100,
            overflow: 'hidden'
          }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSearch(suggestion.label)}
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  borderBottom: index === suggestions.length - 1 ? 'none' : '1px solid #f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {suggestion.type === 'brand' && suggestion.meta?.logo && (
                  <img 
                    src={suggestion.meta.logo} 
                    alt={suggestion.label} 
                    style={{ width: '24px', height: '24px', marginRight: '1rem', objectFit: 'contain' }} 
                  />
                )}
                <div>
                  <div style={{ fontWeight: '600' }}>{suggestion.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {suggestion.type}
                  </div>
                </div>
              </div>
            ))}
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
