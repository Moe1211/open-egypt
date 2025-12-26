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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get User
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const { partnerId, tier } = body

    // Verify Ownership
    const { data: partner, error: pError } = await supabaseClient
      .from('partners')
      .select('id, name, owner_user_id')
      .eq('id', partnerId)
      .eq('owner_user_id', user.id)
      .single()

    if (pError || !partner) throw new Error('Partner not found or unauthorized')

    // Generate Key
    const rawKey = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`
    
    // Hash
    const encoder = new TextEncoder()
    const data = encoder.encode(rawKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Insert Key
    const { error: insertError } = await supabaseClient
      .from('api_keys')
      .insert({
        partner_id: partner.id,
        key_hash: hashHex,
        prefix: rawKey.substring(0, 8),
        tier_id: tier || 'free',
        name: 'Default Key'
      })

    if (insertError) throw insertError

    // Notify Telegram Bot
    const botUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/telegram-bot`
    // Use Service Role to call Bot (bypasses auth checks if bot requires it, though bot checks nothing usually)
    // But sending 'Authorization' header is good practice or required if function is protected.
    await fetch(botUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` 
      },
      body: JSON.stringify({
        action: 'request_approval',
        partnerName: partner.name,
        partnerId: partner.id,
        tier: tier || 'free',
        userEmail: user.email
      })
    })

    return new Response(JSON.stringify({ apiKey: rawKey }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
