"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { GooglePlacesAutocomplete } from "./google-places-autocomplete"

interface SubmitDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubmitDealDialog({ open, onOpenChange }: SubmitDealDialogProps) {
  const [formData, setFormData] = useState({
    restaurant_name: "",
    deal_description: "",
    google_place_id: "",
    days: [] as string[],
    start_time: "",
    end_time: "",
    address: "",
    neighborhood: "",
    phone: "",
    website: "",
    location: null as { lat: number; lng: number } | null,
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Step 1: Create the business
      const businessPayload = {
        name: formData.restaurant_name,
        address: formData.address || null,
        phone: formData.phone || null,
        google_place_id: formData.google_place_id || null,
        website: formData.website || null,
        latitude: formData.location?.lat || null,
        longitude: formData.location?.lng || null,
      }

      const businessResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/businesses/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessPayload),
      })

      if (!businessResponse.ok) {
        const errorData = await businessResponse.json()
        throw new Error(errorData.detail || "Failed to create business")
      }

      const business = await businessResponse.json()

      // Step 2: Create the deal for this business
      const dealPayload = {
        business_id: business.id,
        deal_type: "happy_hour", // Default for now
        days_active: formData.days,
        time_start: formData.start_time,
        time_end: formData.end_time,
        description: formData.deal_description,
      }

      const dealResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dealPayload),
      })

      if (!dealResponse.ok) throw new Error("Failed to create deal")

      toast({
        title: "Success!",
        description: "Your deal has been submitted.",
      })

      setFormData({
        restaurant_name: "",
        deal_description: "",
        google_place_id: "",
        days: [],
        start_time: "",
        end_time: "",
        address: "",
        neighborhood: "",
        phone: "",
        website: "",
        location: null,
      })
      onOpenChange(false)

      // Reload page to show new deal
      window.location.reload()
    } catch (error) {
      console.error("Error submitting deal:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit deal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit a New Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google Place Search */}
          <div className="space-y-2">
            <Label htmlFor="google_place">
              Search Restaurant <span className="text-destructive">*</span>
            </Label>
            <GooglePlacesAutocomplete
              onPlaceSelect={(place) => {
                setFormData({
                  ...formData,
                  google_place_id: place.place_id,
                  restaurant_name: place.name,
                  address: place.formatted_address || formData.address,
                  phone: place.phone_number || formData.phone,
                  website: place.website || formData.website,
                  location: place.location || formData.location,
                })
              }}
            />
            <p className="text-xs text-muted-foreground">
              Search for the restaurant - this will auto-fill name, address, phone, and location
            </p>
          </div>

          {/* Display selected restaurant name */}
          {formData.restaurant_name && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{formData.restaurant_name}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, Oakland, CA 94612"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              placeholder="Jack London Square"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(510) 123-4567"
            />
          </div>

          {/* Deal Description */}
          <div className="space-y-2">
            <Label htmlFor="deal_description">
              Deal Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deal_description"
              value={formData.deal_description}
              onChange={(e) => setFormData({ ...formData, deal_description: e.target.value })}
              required
              placeholder="e.g., $2 off all beers, half-price appetizers"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <Label>
              Days of Week <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <Checkbox
                    id={day}
                    checked={formData.days.includes(day)}
                    onCheckedChange={() => handleDayToggle(day)}
                  />
                  <Label htmlFor={day} className="cursor-pointer font-normal">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_time">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || formData.days.length === 0 || !formData.restaurant_name}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Deal"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
