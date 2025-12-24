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
    const brand = url.searchParams.get('brand')
    const model = url.searchParams.get('model')
    const year = url.searchParams.get('year')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Initialize Supabase Client
    // process.env is not available in Deno, use Deno.env.get
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'open_egypt' }
    })

    // Build Query
    let query = supabase
      .from('price_entries')
      .select(`
        id,
        year_model,
        price_amount,
        currency,
        type,
        valid_from,
        variant:variants (
          name_en,
          name_ar,
          model:models (
            name_en,
            name_ar,
            brand:brands (
              name_en,
              name_ar,
              slug,
              logo_url
            )
          )
        )
      `)
      .range(offset, offset + limit - 1)
      .order('valid_from', { ascending: false })

    // Apply Filters
    if (brand) {
      // We need to filter by brand slug or name. 
      // Supabase inner joins filtering is tricky with dot syntax,
      // but 'variant.model.brand.slug' eq 'brand' works in recent versions if correctly mapped.
      // Alternatively, we filter strictly if we had brand_id on price_entries (denormalization).
      // For now, let's try the deep filter syntax or keep it simple.
      // Deep filtering: !inner ensures the join happens and filters rows.
      query = supabase
        .from('price_entries')
        .select(`
          *,
          variant:variants!inner (
            model:models!inner (
              brand:brands!inner (
                slug
              )
            )
          )
        `)
        .eq('variant.model.brand.slug', brand)
    }
    
    // Simplification for the MVP:
    // The query above with strict typing in the response might be complex to reconstruct.
    // Let's stick to the select and see if we can filter.
    // If filtering by related tables is hard without !inner, we might return all and filter in memory (bad for perf)
    // or properly use !inner for the filter condition.

    if (year) {
      query = query.eq('year_model', year)
    }

    const { data, error } = await query

    if (error) throw error

    // Transformation: Flatten the structure for the public API
    const flatData = data.map((entry: any) => ({
      id: entry.id,
      price: entry.price_amount,
      currency: entry.currency,
      year: entry.year_model,
      brand: entry.variant?.model?.brand?.name_en,
      brand_ar: entry.variant?.model?.brand?.name_ar,
      model: entry.variant?.model?.name_en,
      model_ar: entry.variant?.model?.name_ar,
      variant: entry.variant?.name_en,
      type: entry.type,
      date: entry.valid_from
    }))

    return new Response(JSON.stringify({
      data: flatData,
      meta: {
        limit,
        offset,
        count: flatData.length
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
