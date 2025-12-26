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
    const variantParam = url.searchParams.get('variant') // Partial match on Name
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
    let filterVariant = variantParam

    // Smart Search Logic
    if (q && !brandParam && !modelParam) {
      // 1. Fetch all brands
      const { data: allBrands } = await supabase
        .from('brands')
        .select('id, name_en, slug, name_ar')
      
      if (allBrands) {
        // Sort by length desc to prioritize "Land Rover" over "Land"
        const sortedBrands = allBrands.sort((a, b) => b.name_en.length - a.name_en.length)
        const lowerQ = q.toLowerCase()
        const tokens = lowerQ.split(/\s+/).filter(t => t.length > 0)

        // Strategy A: Check if query *contains* a full brand name (e.g. "Audi A3")
        let matchedBrand = sortedBrands.find(b => 
          lowerQ.includes(b.name_en.toLowerCase()) || 
          lowerQ.includes(b.slug.toLowerCase()) ||
          (b.name_ar && lowerQ.includes(b.name_ar))
        )

        // Strategy B: Check if brand *starts with* the query (e.g. "Aud", "Land Ro")
        if (!matchedBrand) {
          matchedBrand = sortedBrands.find(b => 
            b.name_en.toLowerCase().startsWith(lowerQ) ||
            b.slug.toLowerCase().startsWith(lowerQ)
          )
        }

        // Strategy C: Token Matching (e.g. "Aud A3" -> "Aud" matches "Audi")
        // We look for a token that looks like a brand prefix (min 3 chars)
        if (!matchedBrand) {
          for (const token of tokens) {
            if (token.length < 3) continue; // Skip short tokens like "A3", "GT"
            
            const tokenMatch = sortedBrands.find(b => 
              b.name_en.toLowerCase().startsWith(token) ||
              b.slug.toLowerCase().startsWith(token)
            )
            
            if (tokenMatch) {
              matchedBrand = tokenMatch
              break // Take the first strong match
            }
          }
        }

        if (matchedBrand) {
          filterBrand = matchedBrand.slug
          
          // Remove the matched part from the query to isolate the model
          // We need to be careful to remove the *token* or the *phrase* that matched.
          
          let remainder = lowerQ
          
          // Try removing the full name first
          const nameRegex = new RegExp(`\\b${matchedBrand.name_en}\\b`, 'i')
          if (nameRegex.test(remainder)) {
            remainder = remainder.replace(nameRegex, '')
          } else {
            // Try removing the slug
             const slugRegex = new RegExp(`\\b${matchedBrand.slug}\\b`, 'i')
             if (slugRegex.test(remainder)) {
               remainder = remainder.replace(slugRegex, '')
             } else {
                // Remove the matching token(s) if full name didn't match (Strategy C)
                const matchedToken = tokens.find(t => 
                   t.length >= 3 && (matchedBrand!.name_en.toLowerCase().startsWith(t) || matchedBrand!.slug.toLowerCase().startsWith(t))
                )
                
                if (matchedToken) {
                   remainder = remainder.replace(matchedToken, '')
                }
             }
          }
          
          remainder = remainder.replace(/\s+/g, ' ').trim()
          
          // Detect Model vs Variant in the remainder
          if (remainder.length > 0) {
            // Fetch models for this brand to distinguish Model from Variant
            const { data: brandModels } = await supabase
              .from('models')
              .select('name_en')
              .eq('brand_id', matchedBrand.id)

            let matchedModelName = null

            if (brandModels) {
              // Sort by length desc to match "Land Cruiser" before "Land"
              const sortedModels = brandModels.sort((a, b) => b.name_en.length - a.name_en.length)
              
              // Try to find the model name in the remainder
              const remainderLower = remainder.toLowerCase()
              const foundModel = sortedModels.find(m => {
                const mName = m.name_en.toLowerCase()
                // Check for exact word match to avoid "Corolla" matching "Corolla Cross" partially if logic was different
                // But simple includes is often enough if sorted by length
                return remainderLower.includes(mName)
              })

              if (foundModel) {
                matchedModelName = foundModel.name_en
              }
            }

            if (matchedModelName) {
              filterModel = matchedModelName
              
              // Remove the model from remainder to get variant
              const modelRegex = new RegExp(`\\b${matchedModelName}\\b`, 'i')
              let variantRemainder = remainder.replace(modelRegex, '')
              
              // If regex failed (e.g. slight formatting diff), try simple replace
              if (variantRemainder === remainder) {
                 variantRemainder = remainder.replace(matchedModelName.toLowerCase(), '') // fallback
              }

              filterVariant = variantRemainder.replace(/\s+/g, ' ').trim()
              if (filterVariant.length === 0) filterVariant = null // Cleanup
            } else {
              // No model matched from DB list. 
              // Fallback: Assume the entire remainder is the model (legacy behavior)
              // OR: We could try to guess? But safer to assume Model.
              filterModel = remainder
            }
          }
        } else {
          // No brand matched, assume it's a model search
          filterModel = q
        }
      } else {
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

    if (filterVariant) {
      // Partial match on Variant English Name
      query = query.ilike('variant.name_en', `%${filterVariant}%`)
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
        filters: { q, brand: filterBrand, model: filterModel, variant: filterVariant, year }
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