// Follow Deno standards for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name || 'Egypt'}! Edge Function is live.`,
    context: "This function will handle car price scraping and aggregation logic.",
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})