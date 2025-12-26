import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface GuardResult {
  allowed: boolean
  status: number
  error?: string
  limit?: number
  usage?: number
  partnerId?: string
}

export async function guardApiKey(req: Request): Promise<GuardResult> {
  const apiKey = req.headers.get('x-api-key')
  
  if (!apiKey) {
    return { allowed: false, status: 401, error: 'Missing x-api-key header' }
  }

  // Initialize Admin Client for Key Lookup
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  
  if (!supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    return { allowed: false, status: 500, error: 'Internal Configuration Error' }
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })

  // Hash the key (SHA-256)
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // Lookup Key & Partner Status
  const { data: keyData, error: keyError } = await adminClient
    .from('api_keys')
    .select(`
      id, 
      is_revoked, 
      partners!inner (
        id,
        status
      )
    `)
    .eq('key_hash', hashHex)
    .single()

  if (keyError || !keyData) {
    // Determine if it's a "Showcase" attempt with invalid key or generic
    return { allowed: false, status: 403, error: 'Invalid API Key' }
  }

  if (keyData.is_revoked) {
    return { allowed: false, status: 403, error: 'API Key Revoked' }
  }

  if (keyData.partners.status !== 'ACTIVE') {
    return { allowed: false, status: 403, error: 'Account Pending Approval' }
  }

  // Check Rate Limit (Atomic RPC)
  const { data: usageData, error: usageError } = await adminClient
    .rpc('increment_api_usage', { p_key_id: keyData.id })

  if (usageError) {
    console.error('Rate Limit RPC Error:', usageError)
    // Fail closed
    return { allowed: false, status: 500, error: 'Rate limit check failed' }
  }

  // usageData structure from RPC: { allowed: bool, current_usage: int, limit: int }
  // Note: RPC returns JSON, supabase-js types might need assertion or it just works
  const result = usageData as { allowed: boolean, current_usage: number, limit: number }

  if (!result.allowed) {
    return { 
      allowed: false, 
      status: 429, 
      error: 'Rate limit exceeded',
      limit: result.limit,
      usage: result.current_usage
    }
  }

  return { 
    allowed: true, 
    status: 200,
    limit: result.limit,
    usage: result.current_usage,
    partnerId: keyData.partners.id
  }
}
