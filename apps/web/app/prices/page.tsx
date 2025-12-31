import { supabase } from '@/lib/supabase';
import SearchClient from '../search-client';
import PriceChangeLogs from '@/components/price-change-logs';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Car Prices Database | Open Egypt",
  description: "Browse live car market prices in Egypt. Real-time data aggregated from major market sources.",
  openGraph: {
    title: "Car Prices Database | Open Egypt",
    description: "Browse live car market prices in Egypt. Real-time data aggregated from major market sources.",
    url: "/prices",
  },
};

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60;

export default async function PricesPage() {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .order('name_en', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back to Documentation
        </Link>
      </div>

      <header style={{ marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0' }}>Car Prices Database</h1>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>Live market data from the Open Egypt API.</p>
      </header>
      
      <section>
        <SearchClient />
        
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', marginTop: '3rem' }}>Browse by Brand</h2>
        
        {error && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px' }}>
            Failed to load brands. Check console for details.
          </div>
        )}

        {!brands?.length && !error && (
          <p>No brands found. Database might be empty.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {brands?.map((brand) => (
            <div 
              key={brand.id} 
              style={{ 
                border: '1px solid #e0e0e0', 
                borderRadius: '12px', 
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{brand.name_en}</div>
              {brand.name_ar && <div style={{ color: '#888', marginTop: '0.2rem' }}>{brand.name_ar}</div>}
              {brand.logo_url && <img src={brand.logo_url} alt={brand.name_en} style={{ height: '40px', marginTop: '1rem', objectFit: 'contain' }} />}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '4rem' }}>
        <PriceChangeLogs />
      </section>
    </main>
  );
}
