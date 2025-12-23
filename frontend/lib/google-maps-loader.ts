let isLoading = false
let isLoaded = false
let loadPromise: Promise<void> | null = null

export async function loadGoogleMapsAPI(): Promise<void> {
  // Check if Google Maps is already fully loaded
  if (window.google && window.google.maps) {
    isLoaded = true
    return Promise.resolve()
  }

  // If currently loading, return the existing promise
  if (isLoading && loadPromise) {
    return loadPromise
  }

  // Check if script element already exists in the DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')
  if (existingScript) {
    // Script exists, wait for it to load
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval)
          isLoaded = true
          resolve()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        reject(new Error("Google Maps API load timeout"))
      }, 10000)
    })
  }

  // Start loading
  isLoading = true
  loadPromise = new Promise<void>(async (resolve, reject) => {
    try {
      const response = await fetch("/api/google-maps-key")
      const { apiKey } = await response.json()

      if (!apiKey) {
        throw new Error("Google Maps API key not found")
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        isLoaded = true
        isLoading = false
        resolve()
      }

      script.onerror = () => {
        isLoading = false
        loadPromise = null
        reject(new Error("Failed to load Google Maps API"))
      }

      document.head.appendChild(script)
    } catch (error) {
      isLoading = false
      loadPromise = null
      reject(error)
    }
  })

  return loadPromise
}

export function isGoogleMapsLoaded(): boolean {
  return isLoaded && !!window.google && !!window.google.maps
}
