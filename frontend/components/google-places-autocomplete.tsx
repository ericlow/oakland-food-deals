"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { loadGoogleMapsAPI } from "@/lib/google-maps-loader"

interface PlaceResult {
  place_id: string
  name: string
  formatted_address?: string
  phone_number?: string
  website?: string
  location?: {
    lat: number
    lng: number
  }
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void
}

export function GooglePlacesAutocomplete({ onPlaceSelect }: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await loadGoogleMapsAPI()
        setIsLoaded(true)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load Google Places. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    loadGoogleMaps()
  }, [toast])

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["restaurant", "food"],
        componentRestrictions: { country: "us" },
      })

      // Add listener for place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place?.place_id && place?.name) {
          onPlaceSelect({
            place_id: place.place_id,
            name: place.name,
            formatted_address: place.formatted_address,
            phone_number: place.formatted_phone_number,
            website: place.website,
            location: place.geometry?.location ? {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            } : undefined,
          })
        }
      })
    }
  }, [isLoaded, onPlaceSelect])

  // DEBUG: Log all pointer/mouse events to understand what's happening
  useEffect(() => {
    const events = ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "focusin", "focusout"] as const
    const handlers = events.map((eventName) => {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement
        const isPac = !!target.closest(".pac-container")
        const isOverlay = !!target.closest("[data-slot='dialog-overlay']")
        const isContent = !!target.closest("[data-slot='dialog-content']")
        if (isPac || isOverlay) {
          console.log(`[DEBUG] ${eventName} | target: ${target.tagName}.${target.className.slice(0, 50)} | pac: ${isPac} | overlay: ${isOverlay} | content: ${isContent} | phase: ${e.eventPhase === 1 ? "capture" : e.eventPhase === 2 ? "target" : "bubble"}`)
        }
      }
      document.addEventListener(eventName, handler, true)
      return { eventName, handler }
    })
    return () => {
      handlers.forEach(({ eventName, handler }) => {
        document.removeEventListener(eventName, handler, true)
      })
    }
  }, [])

  return <Input ref={inputRef} type="text" placeholder="Search for a restaurant..." disabled={!isLoaded} />
}
