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
    const brand = url.searchParams.get('brand') // Partial match on Name or Slug
    const model = url.searchParams.get('model') // Partial match on Name
    const year = url.searchParams.get('year')   // Exact match
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'open_egypt' }
    })

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
    if (brand) {
      // Partial match on English Name OR Slug
      // Uses the 'foreignTable' option to scope the OR clause to the joined brand table
      query = query.or(`name_en.ilike.%${brand}%,slug.ilike.%${brand}%`, { foreignTable: 'variant.model.brand' })
    }

    if (model) {
      // Partial match on Model English Name
      query = query.ilike('variant.model.name_en', `%${model}%`)
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
        filters: { brand, model, year }
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