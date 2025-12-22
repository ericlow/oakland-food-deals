import { DealsGrid } from "@/components/deals-grid"
import { DealsMap } from "@/components/deals-map"
import { SubmitDealButton } from "@/components/submit-deal-button"
import { UtensilsCrossed } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <UtensilsCrossed className="h-5 w-5 md:h-7 md:w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Oakland Food Deals</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Community-curated local food deals</p>
              </div>
            </div>
            <SubmitDealButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Map Section */}
        <div className="mb-8 md:mb-10">
          <div className="mb-3 md:mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">Explore Deals Near You</h2>
            <p className="text-sm md:text-base text-muted-foreground">Find the best happy hours across Oakland</p>
          </div>
          <div className="rounded-lg md:rounded-xl overflow-hidden shadow-lg ring-1 ring-border/50">
            <DealsMap />
          </div>
        </div>

        {/* Deals Grid Section */}
        <div>
          <div className="mb-4 md:mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">All Deals</h2>
              <p className="text-sm md:text-base text-muted-foreground">Sorted by popularity</p>
            </div>
          </div>
          <DealsGrid />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 mt-12 md:mt-20">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-muted-foreground">
            <p className="text-xs md:text-sm">© 2025 Oakland Food Deals. Community-powered local dining.</p>
            <div className="flex gap-4">
              <a href="#" className="text-xs md:text-sm hover:text-foreground transition-colors">
                About
              </a>
              <a href="#" className="text-xs md:text-sm hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="text-xs md:text-sm hover:text-foreground transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
