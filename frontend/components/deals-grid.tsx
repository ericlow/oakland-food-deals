"use client"

import { useEffect, useState } from "react"
import { DealCard } from "./deal-card"
import { Loader2 } from "lucide-react"
import { SAMPLE_DEALS } from "@/lib/sample-data"

interface Deal {
  id: number
  restaurant_name: string
  deal_description: string
  original_price: number | null
  deal_price: number | null
  start_date: string
  end_date: string
  vote_count: number
  google_place_id: string | null
  created_by: string | null
  created_at: string
}

export function DealsGrid() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setDeals(SAMPLE_DEALS)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (deals.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">No deals yet. Be the first to submit one!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  )
}
