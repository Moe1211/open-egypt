import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { randomBytes, createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'

dotenv.config({ path: '../../.env' })

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'open_egypt' }
})

async function hashKey(key: string): Promise<string> {
  return createHash('sha256').update(key).digest('hex');
}

async function createPartner(name: string, slug: string) {
  console.log(`Creating partner: ${name}...`)
  
  const { data: partner, error: pError } = await supabase
    .from('partners')
    .insert({ name, slug })
    .select()
    .single()

  if (pError) {
    console.error('Error creating partner:', pError)
    return
  }

  // Generate a random key
  const rawKey = `ok_${randomBytes(24).toString('hex')}`
  const hashedKey = await hashKey(rawKey)
  const prefix = rawKey.substring(0, 8)

  const { error: kError } = await supabase
    .from('api_keys')
    .insert({
      partner_id: partner.id,
      key_hash: hashedKey,
      prefix: prefix
    })

  if (kError) {
    console.error('Error creating API key:', kError)
    return
  }

  const partnerData = {
    id: partner.id,
    name: partner.name,
    slug: partner.slug,
    api_key: rawKey
  }

  // Save to JSON file
  const fileName = `../../debug/api_keys/${partner.id}.json`
  // Save in dir /Users/n1nja/Documents/personal/vercel-personal/open-egypt/debug/api_keys/
  writeFileSync(fileName, JSON.stringify(partnerData, null, 2))

  console.log('✅ Partner Created Successfully!')
  console.log('-----------------------------------')
  console.log(`Partner ID: ${partner.id}`)
  console.log(`API Key:    ${rawKey}`)
  console.log(`Saved to:   ${fileName}`)
  console.log('-----------------------------------')
  console.log('⚠️  Store this key securely. It will not be shown again.')
}

// Usage: tsx create-partner.ts "Showroom Name" "slug"
const args = process.argv.slice(2)
if (args.length < 2) {
  console.log('Usage: pnpm tsx src/create-partner.ts "Partner Name" "slug"')
} else {
  createPartner(args[0], args[1])
}