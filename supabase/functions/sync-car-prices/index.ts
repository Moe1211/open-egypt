import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactCarItem {
  make: { nameAr: string; nameEn: string };
  model: { nameAr: string; nameEn: string };
  year: number;
  price: number;
  cars: Array<{
    engineDescription: string | null;
    price: number;
    year: number;
  }>;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: 'open_egypt' }
    })

    const body = await req.json()
    const items: ContactCarItem[] = body.items || []

    console.log(`Processing ${items.length} items...`)

    for (const item of items) {
      // 1. Upsert Brand
      const brandSlug = slugify(item.make.nameEn)
      const { data: brand, error: bError } = await supabase
        .from('brands')
        .upsert({
          name_en: item.make.nameEn,
          name_ar: item.make.nameAr,
          slug: brandSlug
        }, { onConflict: 'slug' })
        .select('id')
        .single()

      if (bError) {
        console.error(`Error brand ${item.make.nameEn}:`, bError)
        continue
      }

      // 2. Upsert Model
      // Note: We don't have a unique slug for models in schema yet, but brand_id + name_en is logically unique
      const { data: model, error: mError } = await supabase
        .from('models')
        .select('id')
        .eq('brand_id', brand.id)
        .eq('name_en', item.model.nameEn)
        .maybeSingle()

      let modelId = model?.id

      if (!modelId) {
        const { data: newModel, error: miError } = await supabase
          .from('models')
          .insert({
            brand_id: brand.id,
            name_en: item.model.nameEn,
            name_ar: item.model.nameAr
          })
          .select('id')
          .single()
        
        if (miError) {
          console.error(`Error model ${item.model.nameEn}:`, miError)
          continue
        }
        modelId = newModel.id
      }

      // 3. Process Variants & Prices
      for (const car of item.cars) {
        const variantName = car.engineDescription || 'Standard'
        
        // Find or Create Variant
        const { data: variant, error: vError } = await supabase
          .from('variants')
          .select('id')
          .eq('model_id', modelId)
          .eq('name_en', variantName)
          .maybeSingle()

        let variantId = variant?.id

        if (!variantId) {
          const { data: newVariant, error: viError } = await supabase
            .from('variants')
            .insert({
              model_id: modelId,
              name_en: variantName,
              name_ar: variantName
            })
            .select('id')
            .single()
          
          if (viError) {
            console.error(`Error variant ${variantName}:`, viError)
            continue
          }
          variantId = newVariant.id
        }

        // 4. Insert/Update Price
        // We use a "Composite Match" logic: if price + year + variant matches, we skip.
        // If year + variant matches but price is different, we could either update or insert a new log.
        // For the sync pipeline, we usually want the "latest" official/market price.
        
        const { data: existingPrice } = await supabase
          .from('price_entries')
          .select('id, price_amount')
          .match({ variant_id: variantId, year_model: car.year })
          .maybeSingle()

        if (!existingPrice) {
          await supabase.from('price_entries').insert({
            variant_id: variantId,
            year_model: car.year,
            price_amount: car.price,
            currency: 'EGP',
            type: 'MARKET_AVG',
            source_url: 'contactcars.com',
            is_verified: true
          })
        } else if (Number(existingPrice.price_amount) !== car.price) {
          // Update Price
          await supabase.from('price_entries')
            .update({ 
              price_amount: car.price,
              valid_from: new Date().toISOString()
            })
            .eq('id', existingPrice.id)
            
          // Log Price Change
          await supabase.from('price_change_logs').insert({
            price_entry_id: existingPrice.id,
            old_price: existingPrice.price_amount,
            new_price: car.price
          })
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
