'use client'

import { BookOpen, Code, Terminal } from 'lucide-react'

export default function QuickDocs({ apiKey }: { apiKey?: string }) {
  const key = apiKey || 'YOUR_API_KEY'
  
  return (
    <div className="bg-gray-900 text-gray-300 rounded-lg overflow-hidden border border-gray-800">
      <div className="bg-gray-800 px-6 py-3 flex items-center gap-2 border-b border-gray-700">
        <Terminal size={16} className="text-white" />
        <span className="font-mono text-sm font-bold text-white">Quick Start</span>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Get All Brands</h4>
          <div className="bg-black p-4 rounded border border-gray-800 font-mono text-xs overflow-x-auto text-green-400">
            curl -X GET '{process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-car-prices?brands=true' \<br/>
            &nbsp;&nbsp;-H 'Authorization: Bearer {key}'
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Search Models</h4>
          <div className="bg-black p-4 rounded border border-gray-800 font-mono text-xs overflow-x-auto text-blue-400">
            curl -X GET '{process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-car-prices?brand=BMW&year=2024' \<br/>
            &nbsp;&nbsp;-H 'Authorization: Bearer {key}'
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 px-6 py-3 text-center border-t border-gray-700">
        <a href="#" className="text-sm text-white hover:text-blue-300 flex items-center justify-center gap-2">
          <BookOpen size={16} /> View Full Documentation
        </a>
      </div>
    </div>
  )
}
