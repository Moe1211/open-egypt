import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q')?.trim()
    const brandParam = url.searchParams.get('brand') // Partial match on Name or Slug
    const modelParam = url.searchParams.get('model') // Partial match on Name
    const year = url.searchParams.get('year')   // Exact match
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'open_egypt' }
    })

    let filterBrand = brandParam
    let filterModel = modelParam

    // Smart Search Logic
    if (q && !brandParam && !modelParam) {
      // 1. Fetch all brands to detect if query contains a brand
      const { data: allBrands } = await supabase
        .from('brands')
        .select('name_en, slug, name_ar')
      
      if (allBrands) {
        // Sort by length desc to match "Land Rover" before "Land"
        const sortedBrands = allBrands.sort((a, b) => b.name_en.length - a.name_en.length)
        const lowerQ = q.toLowerCase()
        
        const matchedBrand = sortedBrands.find(b => 
          lowerQ.includes(b.name_en.toLowerCase()) || 
          lowerQ.includes(b.slug.toLowerCase()) ||
          (b.name_ar && lowerQ.includes(b.name_ar))
        )

        if (matchedBrand) {
          filterBrand = matchedBrand.slug // Use slug for consistent filtering
          // Remove brand from query to get model
          // specific regex to remove the brand name/slug and clean up spaces
          const brandNameRegex = new RegExp(matchedBrand.name_en, 'i')
          const brandSlugRegex = new RegExp(matchedBrand.slug, 'i')
          let remainder = q.replace(brandNameRegex, '').replace(brandSlugRegex, '').trim()
          
          if (remainder.length > 0) {
            filterModel = remainder
          }
        } else {
          // No brand matched, assume it's a model search
          filterModel = q
        }
      } else {
         // Fallback if brands fetch fails
         filterModel = q
      }
    }

    // 1. Start building the query
    // We use !inner joins to ensure we can filter by nested columns (brand/model names)
    // This assumes strict referential integrity (every price has a variant->model->brand), which is true in our schema.
    let query = supabase
      .from('price_entries')
      .select(`
        id,
        year_model,
        price_amount,
        currency,
        type,
        valid_from,
        variant:variants!inner (
          name_en,
          name_ar,
          model:models!inner (
            name_en,
            name_ar,
            brand:brands!inner (
              name_en,
              name_ar,
              slug,
              logo_url
            )
          )
        )
      `)
      
    // 2. Apply Filters
    if (filterBrand) {
      // Partial match on English Name OR Slug
      // Uses the 'foreignTable' option to scope the OR clause to the joined brand table
      query = query.or(`name_en.ilike.%${filterBrand}%,slug.ilike.%${filterBrand}%`, { foreignTable: 'variant.model.brand' })
    }

    if (filterModel) {
      // Partial match on Model English Name
      query = query.ilike('variant.model.name_en', `%${filterModel}%`)
    }

    if (year) {
      query = query.eq('year_model', year)
    }

    // 3. Sorting & Pagination
    // "Relevance" in this context is interpreted as "Newest Models" and "Newest Pricing".
    query = query
      .order('year_model', { ascending: false })
      .order('valid_from', { ascending: false })
      .range(offset, offset + limit - 1)

    // 4. Execute
    const { data, error } = await query

    if (error) throw error

    // 5. Transform Response
    const flatData = data.map((entry: any) => ({
      id: entry.id,
      price: entry.price_amount,
      currency: entry.currency,
      year: entry.year_model,
      brand: entry.variant?.model?.brand?.name_en,
      brand_ar: entry.variant?.model?.brand?.name_ar,
      brand_slug: entry.variant?.model?.brand?.slug,
      brand_logo: entry.variant?.model?.brand?.logo_url,
      model: entry.variant?.model?.name_en,
      model_ar: entry.variant?.model?.name_ar,
      variant: entry.variant?.name_en,
      variant_ar: entry.variant?.name_ar,
      type: entry.type,
      date: entry.valid_from
    }))

    return new Response(JSON.stringify({
      data: flatData,
      meta: {
        limit,
        offset,
        count: flatData.length,
        filters: { q, brand: filterBrand, model: filterModel, year }
      }
    }), {
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