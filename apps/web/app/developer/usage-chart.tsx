'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2 } from 'lucide-react'

export default function UsageChart({ keyIds }: { keyIds: string[] }) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (keyIds.length > 0) {
      fetchLogs()
    } else {
      setLoading(false)
    }
  }, [keyIds])

  const fetchLogs = async () => {
    try {
      const now = new Date()
      // Align to start of current hour to match DB buckets
      const endHour = new Date(now)
      endHour.setMinutes(0, 0, 0)
      
      // Get last 24 hours (inclusive of current hour)
      const startTime = new Date(endHour.getTime() - 23 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('api_usage')
        .select('hour_bucket, count')
        .in('key_id', keyIds)
        .gte('hour_bucket', startTime.toISOString())

      if (error) throw error

      // Create a map for quick lookup: timestamp ISO string -> total count
      const usageMap = new Map<number, number>()
      
      data?.forEach((row: any) => {
        const time = new Date(row.hour_bucket).getTime()
        const current = usageMap.get(time) || 0
        usageMap.set(time, current + row.count)
      })

      // Generate the last 24 hour buckets filling in zeros where no data exists
      const chartData = []
      for (let i = 0; i < 24; i++) {
        // Calculate time for this bucket (starting from 23 hours ago up to current hour)
        const bucketTime = new Date(startTime.getTime() + i * 60 * 60 * 1000)
        const count = usageMap.get(bucketTime.getTime()) || 0

        chartData.push({
          time: bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          requests: count,
          timestamp: bucketTime.toISOString()
        })
      }
      
      setData(chartData)
    } catch (err) {
      console.error('Error fetching usage stats:', err)
      // On error, show empty state or zeros? Let's show zeros for now to avoid breaking UI
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="h-full flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin" /></div>
  if (keyIds.length === 0) return <div className="h-full flex items-center justify-center text-zinc-500 text-sm">No active keys</div>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis 
          dataKey="time" 
          stroke="#71717a" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          minTickGap={30}
        />
        <YAxis 
          stroke="#71717a" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: '#818cf8' }}
        />
        <Area 
          type="monotone" 
          dataKey="requests" 
          stroke="#818cf8" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRequests)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}