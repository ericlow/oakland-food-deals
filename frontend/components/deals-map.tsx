"use client"

import { useEffect, useState, useRef } from "react"
import { Loader2, MapPin } from "lucide-react"
import { SAMPLE_DEALS } from "@/lib/sample-data"
import { loadGoogleMapsAPI } from "@/lib/google-maps-loader"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function DealsMap() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMapsAPI()

        if (mapRef.current && !mapInstanceRef.current) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat: 37.8044, lng: -122.2712 },
            zoom: 13,
            mapId: "oakland_food_deals_map",
          })
          mapInstanceRef.current = map

          SAMPLE_DEALS.forEach((deal) => {
            const marker = new window.google.maps.marker.AdvancedMarkerElement({
              map,
              position: deal.location,
              title: deal.restaurant_name,
            })

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="font-weight: 600; margin-bottom: 4px;">${deal.restaurant_name}</h3>
                  <p style="font-size: 14px; margin: 0;">${deal.deal_description}</p>
                </div>
              `,
            })

            marker.addListener("click", () => {
              infoWindow.open(map, marker)
            })
          })

          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        setError(true)
        setIsLoading(false)
      }
    }

    initializeMap()
  }, [])

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border bg-card">
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted p-6 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-foreground">Map Unavailable</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add GOOGLE_MAPS_API_KEY in the Vars section to view the map
            </p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
}
