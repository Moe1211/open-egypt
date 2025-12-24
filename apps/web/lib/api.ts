export interface CarPrice {
  id: string
  price: number
  currency: string
  year: number
  brand: string
  brand_ar: string
  brand_slug: string
  brand_logo: string
  model: string
  model_ar: string
  variant: string
  variant_ar: string
  type: string
  date: string
}

export interface SearchParams {
  brand?: string
  model?: string
  year?: string
  limit?: number
  offset?: number
}

const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-car-prices`

export async function searchCarPrices(params: SearchParams): Promise<CarPrice[]> {
  const query = new URLSearchParams()
  if (params.brand) query.set('brand', params.brand)
  if (params.model) query.set('model', params.model)
  if (params.year) query.set('year', params.year)
  if (params.limit) query.set('limit', params.limit.toString())
  if (params.offset) query.set('offset', params.offset.toString())

  try {
    const res = await fetch(`${EDGE_FUNCTION_URL}?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data || []
  } catch (error) {
    console.error('Failed to fetch car prices:', error)
    return []
  }
}
