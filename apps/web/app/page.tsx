import { supabase } from '../lib/supabase';

// Revalidate data every 60 seconds (ISR)
export const revalidate = 60;

export default async function Home() {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('*')
    .order('name_en', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0' }}>Open Egypt</h1>
        <p style={{ color: '#666', fontSize: '1.2rem' }}>The "Shadow" Open Data Infrastructure.</p>
      </header>
      
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Supported Car Brands</h2>
        
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
              <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
                {brand.slug}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: '4rem', color: '#999', fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
        <p>Status: ⚠️ Pre-Alpha | Foundation Layer</p>
      </footer>
    </main>
  );
}