import { NextResponse } from 'next/server'

export const runtime = 'edge'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    const targetUrl = `${SUPABASE_URL}/functions/v1/autocomplete?q=${encodeURIComponent(q)}&limit=10`

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-api-key': process.env.SHOWCASE_API_KEY || '',
      },
    })

    if (!res.ok) {
      throw new Error(`Upstream Error: ${res.statusText}`)
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Proxy Error:', error)
    return NextResponse.json({ suggestions: [] }, { status: 500 })
  }
}
