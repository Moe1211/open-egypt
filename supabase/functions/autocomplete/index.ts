import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim() || ''
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Minimum 1 character to start searching
    if (q.length < 1) {
       return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'open_egypt' }
    })

    // Parallel search:
    // 1. Brands matching name (EN/AR)
    // 2. Models matching name (EN)
    
    const brandQuery = supabase
      .from('brands')
      .select('name_en, name_ar, slug, logo_url')
      .or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`)
      .limit(limit)

    const modelQuery = supabase
      .from('models')
      .select(`
        name_en, 
        name_ar, 
        brand:brands (
          name_en,
          slug
        )
      `)
      .ilike('name_en', `%${q}%`)
      .limit(limit)

    const [brandsRes, modelsRes] = await Promise.all([brandQuery, modelQuery])

    if (brandsRes.error) throw brandsRes.error
    if (modelsRes.error) throw modelsRes.error

    const suggestions: any[] = []

    // Process Brands
    // Result format: { type, label, value, ...meta }
    brandsRes.data.forEach((b: any) => {
      suggestions.push({
        type: 'brand',
        label: b.name_en,
        label_ar: b.name_ar,
        value: b.slug,
        meta: { logo: b.logo_url }
      })
    })

    // Process Models
    modelsRes.data.forEach((m: any) => {
      const brandName = m.brand?.name_en || ''
      suggestions.push({
        type: 'model',
        label: `${brandName} ${m.name_en}`.trim(),
        label_ar: m.name_ar, 
        value: m.name_en, // Value to search for (usually just model name if searching by model)
        meta: { 
          brand: brandName,
          brand_slug: m.brand?.slug 
        }
      })
    })

    // Ranking Logic
    const lowerQ = q.toLowerCase()
    
    suggestions.sort((a, b) => {
      const aLabel = a.label.toLowerCase()
      const bLabel = b.label.toLowerCase()
      
      // 1. Exact Match on Label
      const aExact = aLabel === lowerQ
      const bExact = bLabel === lowerQ
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      
      // 2. Starts With
      const aStarts = aLabel.startsWith(lowerQ)
      const bStarts = bLabel.startsWith(lowerQ)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      
      // 3. Type Priority: Brands first?
      if (a.type === 'brand' && b.type === 'model') return -1
      if (a.type === 'model' && b.type === 'brand') return 1
      
      return 0
    })

    // Slice final result
    const finalSuggestions = suggestions.slice(0, limit)

    return new Response(JSON.stringify({ suggestions: finalSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
