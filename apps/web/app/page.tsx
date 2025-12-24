import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif', lineHeight: '1.6' }}>
      {/* Hero Section */}
      <header style={{ marginBottom: '4rem', textAlign: 'center', padding: '4rem 0', background: 'linear-gradient(to bottom, #ffffff, #f9fafb)', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '0 0 1rem 0', letterSpacing: '-0.05em' }}>
          Open Egypt
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#666', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          The "Shadow" Open Data Infrastructure for Egypt.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/prices" style={{ 
            background: '#000', 
            color: '#fff', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '600',
            transition: 'opacity 0.2s'
          }}>
            Search Car Prices →
          </Link>
          <a href="https://github.com/Moe1211/open-egypt" target="_blank" style={{ 
            background: '#fff', 
            color: '#000', 
            border: '1px solid #e0e0e0', 
            padding: '0.8rem 1.5rem', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '600' 
          }}>
            View on GitHub
          </a>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        {/* Module: Car Prices */}
        <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '16px', background: '#fff' }}>
          <h2 style={{ marginTop: '0', fontSize: '1.5rem' }}>🚗 Car Prices API</h2>
          <p style={{ color: '#666' }}>
            A public, transparent API for automotive pricing in Egypt. Aggregated from major market sources.
          </p>
          <ul style={{ color: '#555', paddingLeft: '1.2rem' }}>
            <li>Real-time market data</li>
            <li>Historical price tracking</li>
            <li>Brand & Model aggregation</li>
          </ul>
          <div style={{ marginTop: '1.5rem' }}>
             <code style={{ background: '#f5f5f5', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem' }}>GET /functions/v1/get-car-prices</code>
          </div>
        </div>

        {/* Module: Architecture */}
        <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '16px', background: '#fff' }}>
          <h2 style={{ marginTop: '0', fontSize: '1.5rem' }}>🏗️ Architecture</h2>
          <p style={{ color: '#666' }}>
            Built on a "Supabase Native" stack to ensure zero maintenance and infinite scalability.
          </p>
          <ul style={{ color: '#555', paddingLeft: '1.2rem' }}>
            <li><strong>Database:</strong> PostgreSQL (Open Egypt Schema)</li>
            <li><strong>Logic:</strong> Edge Functions (Deno)</li>
            <li><strong>Frontend:</strong> Next.js App Router</li>
          </ul>
        </div>
      </div>

      {/* Documentation Preview */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Documentation</h2>
        
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.3rem' }}>Project Philosophy</h3>
          <p>
            "If the data doesn't exist, we build it." Open Egypt is an initiative to digitize the missing public infrastructure. 
            We do not wait for official APIs. We scrape, aggregate, and normalize data into a public good.
          </p>

          <h3 style={{ fontSize: '1.3rem', marginTop: '2rem' }}>For Developers</h3>
          <p>
            This project enforces strict <strong>Zero Technical Debt</strong> policies.
          </p>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>Monorepo:</strong> Managed with PNPM Workspaces.</li>
            <li><strong>Type Safety:</strong> 100% TypeScript. Shared types between DB and Web.</li>
            <li><strong>Migrations:</strong> Manual SQL review process. No automatic schema drifts.</li>
          </ul>
        </div>
      </section>

      <footer style={{ marginTop: '4rem', color: '#999', fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '2rem', textAlign: 'center' }}>
        <p>© 2025 Open Egypt Initiative. Open Source.</p>
      </footer>
    </main>
  );
}
