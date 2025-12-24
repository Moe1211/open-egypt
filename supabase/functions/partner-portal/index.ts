import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.210.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-partner-key',
}

async function hashKey(key: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Use Service Role to access api_keys and sensitive tables
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      db: { schema: 'open_egypt' }
    })

    // 1. Auth: Validate API Key
    const apiKey = req.headers.get('x-partner-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing x-partner-key header' }), { status: 401, headers: corsHeaders })
    }

    const hashedKey = await hashKey(apiKey)
    const { data: keyData, error: keyError } = await supabaseAdmin
      .from('api_keys')
      .select('partner_id, is_revoked, partners(name)')
      .eq('key_hash', hashedKey)
      .single()

    if (keyError || !keyData || keyData.is_revoked) {
      return new Response(JSON.stringify({ error: 'Invalid or revoked API Key' }), { status: 403, headers: corsHeaders })
    }

    const partnerId = keyData.partner_id
    const partnerName = keyData.partners?.name

    // 2. Handle Requests
    if (req.method === 'GET') {
      // Fetch partner's data
      const { data, error } = await supabaseAdmin
        .from('price_entries')
        .select(`
          *,
          variant:variants (
            name_en,
            model:models (
              name_en,
              brand:brands (name_en)
            )
          )
        `)
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ 
        partner: { name: partnerName, id: partnerId },
        data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { action, payload } = body

      if (action === 'get_metadata') {
        const { type, filter_id } = payload
        
        if (type === 'brands') {
          const { data, error } = await supabaseAdmin.from('brands').select('id, name_en').order('name_en')
          if (error) throw error
          return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (type === 'models' && filter_id) {
          const { data, error } = await supabaseAdmin.from('models').select('id, name_en').eq('brand_id', filter_id).order('name_en')
          if (error) throw error
          return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (type === 'variants' && filter_id) {
          const { data, error } = await supabaseAdmin.from('variants').select('id, name_en').eq('model_id', filter_id).order('name_en')
          if (error) throw error
          return new Response(JSON.stringify({ data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      if (action === 'get_price_history') {
        const { entry_id } = payload

        if (!entry_id) {
          return new Response(JSON.stringify({ error: 'Missing entry_id' }), { status: 400, headers: corsHeaders })
        }

        // Verify ownership
        const { data: entry, error: entryError } = await supabaseAdmin
          .from('price_entries')
          .select('price_amount, created_at')
          .eq('id', entry_id)
          .eq('partner_id', partnerId)
          .single()

        if (entryError || !entry) {
          return new Response(JSON.stringify({ error: 'Entry not found or unauthorized' }), { status: 404, headers: corsHeaders })
        }

        // Fetch logs
        const { data: logs, error: logsError } = await supabaseAdmin
          .from('price_change_logs')
          .select('old_price, new_price, created_at')
          .eq('price_entry_id', entry_id)
          .order('created_at', { ascending: true })

        if (logsError) throw logsError

        // Construct history array
        // Start with the initial price if logs exist, otherwise just current
        // Actually, logs contain old_price and new_price. 
        // We can map logs to points.
        
        const history = logs.map((log: any) => ({
          date: log.created_at,
          price: log.new_price
        }))

        // Add current state as the latest point (if not already covered by last log, effectively it is the last log's new_price, but let's be sure)
        // If there are no logs, the only history is the creation time and current price.
        if (history.length === 0) {
           history.push({ date: entry.created_at, price: entry.price_amount })
        } else {
           // Ensure the very first "old_price" is represented? 
           // Yes, the first log's old_price was the price before the first change.
           const firstLog = logs[0]
           if (firstLog.old_price) {
             history.unshift({
               date: firstLog.created_at, // Ideally this would be the *previous* timestamp, but we might not have it easily. We'll use the change time for now or look for creation time.
               price: firstLog.old_price
             })
           }
        }

        return new Response(JSON.stringify({ data: history }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      if (action === 'create_listing') {
        const { variant_id, year_model, price_amount } = payload

        // Basic Validation
        if (!variant_id || !year_model || !price_amount) {
           return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders })
        }

        const { data, error } = await supabaseAdmin
          .from('price_entries')
          .insert({
            partner_id: partnerId,
            variant_id,
            year_model,
            price_amount,
            currency: 'EGP',
            type: 'OFFICIAL', // Default for partners? Or let them choose?
            is_verified: true, // Partners are trusted?
            confidence_score: 100
          })
          .select()
          .single()

        if (error) throw error

        // Audit Log
        await supabaseAdmin.from('audit_logs').insert({
          partner_id: partnerId,
          action: 'CREATE_LISTING',
          entity_table: 'price_entries',
          entity_id: data.id,
          new_data: { variant_id, year_model, price_amount }
        })

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      if (action === 'update_price') {
        const { id, new_price } = payload
        
        // Fetch old price for logging
        const { data: oldEntry, error: fetchError } = await supabaseAdmin
          .from('price_entries')
          .select('price_amount')
          .eq('id', id)
          .eq('partner_id', partnerId) // Security check: Ensure they own this row
          .single()

        if (fetchError || !oldEntry) {
          return new Response(JSON.stringify({ error: 'Entry not found or unauthorized' }), { status: 404, headers: corsHeaders })
        }

        // Update Price
        const { error: updateError } = await supabaseAdmin
          .from('price_entries')
          .update({ 
            price_amount: new_price, 
            valid_from: new Date().toISOString() // Update timestamp
          })
          .eq('id', id)

        if (updateError) throw updateError

        // Log Change (Fire and Forget or Await?) -> Await for safety
        await supabaseAdmin.from('price_change_logs').insert({
          price_entry_id: id,
          old_price: oldEntry.price_amount,
          new_price: new_price,
          changed_by_partner_id: partnerId
        })

        // Audit Log
        await supabaseAdmin.from('audit_logs').insert({
          partner_id: partnerId,
          action: 'UPDATE_PRICE',
          entity_table: 'price_entries',
          entity_id: id,
          old_data: { price: oldEntry.price_amount },
          new_data: { price: new_price }
        })

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      
      return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders })
    }

    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
