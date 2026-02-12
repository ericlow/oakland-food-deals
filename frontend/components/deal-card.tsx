"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowUp, MessageSquare, Clock } from "lucide-react"
import Link from "next/link"

interface Deal {
  id: number
  restaurant_name: string
  deal_description: string
  original_price: number | null
  deal_price: number | null
  schedule: {
    days: string[]
    start_time: string
    end_time: string
  }
  vote_count: number
  google_place_id: string | null
  created_by: string | null
  created_at: string
  image_url?: string
}

interface DealCardProps {
  deal: Deal
}

export function DealCard({ deal }: DealCardProps) {
  const formatHappyHourTime = () => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "pm" : "am"
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}:${minutes}${ampm}`
    }

    const daysText =
      deal.schedule.days.length === 7
        ? "Every day"
        : deal.schedule.days.length === 5 &&
            deal.schedule.days.every((d) => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(d))
          ? "Mon-Fri"
          : deal.schedule.days.length === 2 &&
              deal.schedule.days.includes("Saturday") &&
              deal.schedule.days.includes("Sunday")
            ? "Weekends"
            : deal.schedule.days.length === 1
              ? deal.schedule.days[0]
              : deal.schedule.days.join(", ")

    return `${daysText}, ${formatTime(deal.schedule.start_time)}-${formatTime(deal.schedule.end_time)}`
  }

  return (
    <Link href={`/deals/${deal.id}`}>
      <Card className="relative flex h-[280px] md:h-full flex-col transition-shadow hover:shadow-md cursor-pointer overflow-hidden">
        {deal.image_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${deal.image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40" />
          </>
        )}

        <CardHeader className="relative z-10 pb-2 md:pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="text-base md:text-lg font-semibold leading-tight text-white">{deal.restaurant_name}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs md:text-sm text-white/90">
                <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span>{formatHappyHourTime()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex-1 pb-2 md:pb-3">
          <p className="text-xs md:text-sm text-white leading-relaxed line-clamp-3 whitespace-pre-line">{deal.deal_description}</p>
        </CardContent>

        <CardFooter className="relative z-10 flex items-center justify-between border-t border-white/20 pt-2 md:pt-3">
          <div className="flex items-center gap-2">
            <ArrowUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/80" />
            <span className="font-semibold text-xs md:text-sm text-white">{deal.vote_count}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">View details</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
