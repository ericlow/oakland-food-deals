"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowUp, ArrowDown, Loader2, Send, Clock, ArrowLeft, Pencil, MapPin, Phone, Navigation } from "lucide-react"
import { SAMPLE_DEALS, SAMPLE_COMMENTS } from "@/lib/sample-data"
import Link from "next/link"
import Image from "next/image"
import { loadGoogleMapsAPI } from "@/lib/google-maps-loader"

interface Deal {
  id: number
  business_id?: number
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
  location?: { lat: number; lng: number }
  address?: string
  neighborhood?: string
  phone?: string
  image_url?: string
}

interface Comment {
  id: number
  deal_id: number
  comment_text: string
  vote_count: number
  created_by: string | null
  created_at: string
}

const DealDetails: React.FC<{ dealId: number }> = ({ dealId }) => {
  const [deal, setDeal] = useState<Deal | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [hasVoted, setHasVoted] = useState<"up" | "down" | null>(null)
  const [commentVotes, setCommentVotes] = useState<Record<number, "up" | "down" | null>>({})
  const [editForm, setEditForm] = useState({
    restaurant_name: "",
    days: [] as string[],
    start_time: "",
    end_time: "",
    deal_description: "",
    address: "",
    neighborhood: "",
    phone: "",
  })
  const { toast } = useToast()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Check if user has already voted on this deal
  useEffect(() => {
    const voteKey = `voted_deal_${dealId}`
    const existingVote = localStorage.getItem(voteKey)
    if (existingVote === "up" || existingVote === "down") {
      setHasVoted(existingVote)
    }
  }, [dealId])

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        // Fetch the deal from the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/deals-enriched`)
        if (!response.ok) {
          throw new Error('Failed to fetch deals')
        }
        const deals = await response.json()
        const foundDeal = deals.find((d: Deal) => d.id === dealId)

        setDeal(foundDeal || null)

        // Fetch comments for this deal
        const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/?deal_id=${dealId}`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          const mappedComments = commentsData.map((c: any) => ({
            id: c.id,
            deal_id: c.deal_id,
            comment_text: c.text,
            vote_count: c.vote_score,
            created_by: c.created_by,
            created_at: c.created_at,
          })).sort((a: Comment, b: Comment) => b.vote_count - a.vote_count)

          setComments(mappedComments)

          // Load comment votes from localStorage
          const votes: Record<number, "up" | "down" | null> = {}
          mappedComments.forEach((comment: Comment) => {
            const voteKey = `voted_comment_${comment.id}`
            const existingVote = localStorage.getItem(voteKey)
            if (existingVote === "up" || existingVote === "down") {
              votes[comment.id] = existingVote
            }
          })
          setCommentVotes(votes)
        } else {
          setComments([])
        }

        setLoading(false)

        if (foundDeal) {
          setEditForm({
            restaurant_name: foundDeal.restaurant_name,
            days: foundDeal.schedule.days,
            start_time: foundDeal.schedule.start_time,
            end_time: foundDeal.schedule.end_time,
            deal_description: foundDeal.deal_description,
            address: foundDeal.address || "",
            neighborhood: foundDeal.neighborhood || "",
            phone: foundDeal.phone || "",
          })
        }
      } catch (error) {
        console.error('Error fetching deal:', error)
        // Fallback to sample data
        const foundDeal = SAMPLE_DEALS.find((d) => d.id === dealId)
        setDeal(foundDeal || null)
        setComments(SAMPLE_COMMENTS.filter((c) => c.deal_id === dealId))
        setLoading(false)
        if (foundDeal) {
          setEditForm({
            restaurant_name: foundDeal.restaurant_name,
            days: foundDeal.schedule.days,
            start_time: foundDeal.schedule.start_time,
            end_time: foundDeal.schedule.end_time,
            deal_description: foundDeal.deal_description,
            address: foundDeal.address || "",
            neighborhood: foundDeal.neighborhood || "",
            phone: foundDeal.phone || "",
          })
        }
      }
    }

    fetchDeal()
  }, [dealId])

  useEffect(() => {
    if (deal?.location && mapRef.current) {
      loadGoogleMap()
    }
  }, [deal])

  const loadGoogleMap = async () => {
    try {
      if (!deal?.location) return

      await loadGoogleMapsAPI()

      if (mapRef.current && deal.location && !mapInstanceRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: deal.location,
          zoom: 16,
          mapId: "deal_details_map",
        })
        mapInstanceRef.current = map

        new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: deal.location,
          title: deal.restaurant_name,
        })
      }
    } catch (error) {
      console.error("Error loading Google Maps:", error)
    }
  }

  const handleVote = async (direction: "up" | "down") => {
    if (!deal) return

    try {
      const voteKey = `voted_deal_${deal.id}`

      // If clicking the same vote button, remove the vote
      if (hasVoted === direction) {
        // Send opposite vote to cancel out the previous vote
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${deal.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: direction === "up" ? -1 : 1 })
        })

        if (!response.ok) {
          throw new Error('Failed to remove vote')
        }

        const updatedDeal = await response.json()
        setDeal({ ...deal, vote_count: updatedDeal.vote_score })

        // Remove vote from localStorage
        localStorage.removeItem(voteKey)
        setHasVoted(null)

        return
      }

      // If changing vote (had upvote, now downvote or vice versa)
      if (hasVoted && hasVoted !== direction) {
        // First, remove the old vote
        const removeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${deal.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: hasVoted === "up" ? -1 : 1 })
        })

        if (!removeResponse.ok) {
          throw new Error('Failed to change vote')
        }

        // Then add the new vote
        const addResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${deal.id}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: direction === "up" ? 1 : -1 })
        })

        if (!addResponse.ok) {
          throw new Error('Failed to change vote')
        }

        const updatedDeal = await addResponse.json()
        setDeal({ ...deal, vote_count: updatedDeal.vote_score })

        // Update vote in localStorage
        localStorage.setItem(voteKey, direction)
        setHasVoted(direction)

        return
      }

      // New vote (no previous vote)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${deal.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: direction === "up" ? 1 : -1 })
      })

      if (!response.ok) {
        throw new Error('Failed to record vote')
      }

      const updatedDeal = await response.json()
      setDeal({ ...deal, vote_count: updatedDeal.vote_score })

      // Store vote in localStorage
      localStorage.setItem(voteKey, direction)
      setHasVoted(direction)
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCommentVote = async (commentId: number, direction: "up" | "down") => {
    try {
      const voteKey = `voted_comment_${commentId}`
      const currentVote = commentVotes[commentId]

      // If clicking the same vote button, remove the vote
      if (currentVote === direction) {
        // Send opposite vote to cancel out the previous vote
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: direction === "up" ? -1 : 1 })
        })

        if (!response.ok) {
          throw new Error('Failed to remove vote')
        }

        const updatedComment = await response.json()
        setComments((prev) =>
          prev
            .map((comment) =>
              comment.id === commentId
                ? { ...comment, vote_count: updatedComment.vote_score }
                : comment,
            )
            .sort((a, b) => b.vote_count - a.vote_count),
        )

        // Remove vote from localStorage
        localStorage.removeItem(voteKey)
        setCommentVotes({ ...commentVotes, [commentId]: null })

        return
      }

      // If changing vote (had upvote, now downvote or vice versa)
      if (currentVote && currentVote !== direction) {
        // First, remove the old vote
        const removeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: currentVote === "up" ? -1 : 1 })
        })

        if (!removeResponse.ok) {
          throw new Error('Failed to change vote')
        }

        // Then add the new vote
        const addResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote: direction === "up" ? 1 : -1 })
        })

        if (!addResponse.ok) {
          throw new Error('Failed to change vote')
        }

        const updatedComment = await addResponse.json()
        setComments((prev) =>
          prev
            .map((comment) =>
              comment.id === commentId
                ? { ...comment, vote_count: updatedComment.vote_score }
                : comment,
            )
            .sort((a, b) => b.vote_count - a.vote_count),
        )

        // Update vote in localStorage
        localStorage.setItem(voteKey, direction)
        setCommentVotes({ ...commentVotes, [commentId]: direction })

        return
      }

      // New vote (no previous vote)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: direction === "up" ? 1 : -1 })
      })

      if (!response.ok) {
        throw new Error('Failed to record vote')
      }

      const updatedComment = await response.json()
      setComments((prev) =>
        prev
          .map((comment) =>
            comment.id === commentId
              ? { ...comment, vote_count: updatedComment.vote_score }
              : comment,
          )
          .sort((a, b) => b.vote_count - a.vote_count),
      )

      // Store vote in localStorage
      localStorage.setItem(voteKey, direction)
      setCommentVotes({ ...commentVotes, [commentId]: direction })
    } catch (error) {
      console.error('Error voting on comment:', error)
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          deal_id: dealId,
          created_by: "anonymous"
        })
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newCommentObj = await response.json()

      // Add new comment to list and sort by vote count
      setComments([...comments, {
        id: newCommentObj.id,
        deal_id: newCommentObj.deal_id,
        comment_text: newCommentObj.text,
        vote_count: newCommentObj.vote_score,
        created_by: newCommentObj.created_by,
        created_at: newCommentObj.created_at,
      }].sort((a, b) => b.vote_count - a.vote_count))

      setNewComment("")
      toast({
        title: "Comment posted!",
        description: "Thanks for sharing your thoughts.",
      })
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deal) return

    try {
      // Update business info (name, address, phone)
      const businessResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/businesses/${deal.business_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.restaurant_name,
          address: editForm.address,
          phone: editForm.phone,
        })
      })

      if (!businessResponse.ok) {
        throw new Error('Failed to update business')
      }

      // Update deal info (days, times, description)
      const dealResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days_active: editForm.days.map(d => d.toLowerCase()),
          time_start: editForm.start_time,
          time_end: editForm.end_time,
          description: editForm.deal_description,
        })
      })

      if (!dealResponse.ok) {
        throw new Error('Failed to update deal')
      }

      // Update local state with new values
      setDeal({
        ...deal,
        restaurant_name: editForm.restaurant_name,
        schedule: {
          days: editForm.days,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
        },
        deal_description: editForm.deal_description,
        address: editForm.address,
        neighborhood: editForm.neighborhood,
        phone: editForm.phone,
      })

      setEditDialogOpen(false)
      toast({
        title: "Deal updated!",
        description: "Your changes have been saved to the database.",
      })
    } catch (error) {
      console.error('Error updating deal:', error)
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatHappyHourTime = () => {
    if (!deal) return ""

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
          ? "Monday-Friday"
          : deal.schedule.days.length === 2 &&
              deal.schedule.days.includes("Saturday") &&
              deal.schedule.days.includes("Sunday")
            ? "Weekends"
            : deal.schedule.days.join(", ")

    return `${daysText}, ${formatTime(deal.schedule.start_time)}-${formatTime(deal.schedule.end_time)}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const sortedComments = [...comments].sort((a, b) => b.vote_count - a.vote_count)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-lg text-muted-foreground">Deal not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section with Background Image */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden">
        <Image
          src={deal.image_url || "/placeholder.svg?height=400&width=1200"}
          alt={deal.restaurant_name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Hero Content */}
        <div className="relative h-full">
          <div className="container mx-auto px-4 py-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/20 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to deals
              </Button>
            </Link>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-2 md:space-y-3 text-white">
                    <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">{deal.restaurant_name}</h1>

                    <div className="flex items-center gap-2 text-sm md:text-lg drop-shadow">
                      <Clock className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="font-medium">{formatHappyHourTime()}</span>
                    </div>

                    {deal.neighborhood && (
                      <div className="flex items-center gap-2 text-xs md:text-base drop-shadow">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                        <span>{deal.neighborhood}</span>
                      </div>
                    )}
                  </div>

                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-white/90 hover:bg-white text-foreground self-start md:self-auto"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Deal</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name of Business</Label>
                          <Input
                            id="name"
                            value={editForm.restaurant_name}
                            onChange={(e) => setEditForm({ ...editForm, restaurant_name: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={editForm.address}
                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            placeholder="123 Main St, Oakland, CA 94612"
                          />
                        </div>

                        <div>
                          <Label htmlFor="neighborhood">Neighborhood</Label>
                          <Input
                            id="neighborhood"
                            value={editForm.neighborhood}
                            onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })}
                            placeholder="Jack London Square"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            placeholder="(510) 123-4567"
                          />
                        </div>

                        <div>
                          <Label>Days of Week</Label>
                          <div className="mt-2 space-y-2">
                            {DAYS_OF_WEEK.map((day) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={day}
                                  checked={editForm.days.includes(day)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setEditForm({ ...editForm, days: [...editForm.days, day] })
                                    } else {
                                      setEditForm({ ...editForm, days: editForm.days.filter((d) => d !== day) })
                                    }
                                  }}
                                />
                                <Label htmlFor={day} className="font-normal cursor-pointer">
                                  {day}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="start">Start Time</Label>
                            <Input
                              id="start"
                              type="time"
                              value={editForm.start_time}
                              onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="end">End Time</Label>
                            <Input
                              id="end"
                              type="time"
                              value={editForm.end_time}
                              onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editForm.deal_description}
                            onChange={(e) => setEditForm({ ...editForm, deal_description: e.target.value })}
                            className="min-h-[120px]"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="text-white space-y-3 md:space-y-4">
                  <p className="text-sm md:text-base leading-relaxed drop-shadow">{deal.deal_description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote("up")}
                      className={`bg-white/90 hover:bg-white text-foreground ${hasVoted === "up" ? "border-green-500 border-2" : ""}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-xl md:text-2xl font-bold drop-shadow-lg">{deal.vote_count}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote("down")}
                      className={`bg-white/90 hover:bg-white text-foreground ${hasVoted === "down" ? "border-red-500 border-2" : ""}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
          {/* Map */}
          <Card className="overflow-hidden shadow-lg">
            <div ref={mapRef} className="h-[250px] md:h-[300px] w-full bg-muted" />
          </Card>

          {/* Contact Information */}
          <Card className="p-4 md:p-6 shadow-lg">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">Location & Contact</h2>
            <div className="space-y-2 md:space-y-3">
              {deal.address && (
                <div className="flex items-start gap-2 md:gap-3 text-sm md:text-base text-foreground">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 mt-0.5 text-primary flex-shrink-0" />
                  <span>{deal.address}</span>
                </div>
              )}

              {deal.phone && (
                <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-foreground">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <a href={`tel:${deal.phone}`} className="hover:text-primary transition-colors">
                    {deal.phone}
                  </a>
                </div>
              )}

              {deal.location && (
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${deal.location.lat},${deal.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm md:text-base text-primary hover:underline font-medium"
                  >
                    <Navigation className="h-4 w-4 md:h-5 md:w-5" />
                    Get Directions
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Comments Section */}
          <Card className="p-4 md:p-6 shadow-lg">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4">Comments</h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-4 md:mb-6">
              <div className="flex flex-col gap-2 md:flex-row">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this deal..."
                  className="min-h-[80px] resize-none"
                  disabled={submitting}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={submitting || !newComment.trim()}
                  className="shrink-0 self-end md:self-auto"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 md:space-y-4">
              {sortedComments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                sortedComments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-border bg-card p-3 md:p-4">
                    <p className="text-sm text-foreground leading-relaxed">{comment.comment_text}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentVote(comment.id, "up")}
                          className={`h-8 gap-1 px-2 ${commentVotes[comment.id] === "up" ? "border-green-500 border-2" : ""}`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-sm font-semibold text-primary min-w-[2ch] text-center">
                          {comment.vote_count}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommentVote(comment.id, "down")}
                          className={`h-8 gap-1 px-2 ${commentVotes[comment.id] === "down" ? "border-red-500 border-2" : ""}`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export { DealDetails }
export default DealDetails
