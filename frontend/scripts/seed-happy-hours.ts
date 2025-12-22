// Script to populate the database with sample Oakland happy hour deals

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const sampleDeals = [
  {
    title: "Half Off All Draft Beers",
    description:
      "Enjoy 50% off all draft beers during happy hour. Great selection of local craft beers from Oakland breweries.",
    restaurant_name: "Drake's Dealership",
    location: "2325 Broadway, Oakland, CA 94612",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx1",
    deal_type: "happy_hour",
    price_range: "$$",
    start_time: "15:00:00",
    end_time: "18:00:00",
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  {
    title: "$5 Appetizers & $6 Cocktails",
    description:
      "All appetizers just $5 and signature cocktails $6. Perfect spot to unwind after work with a great view of Lake Merritt.",
    restaurant_name: "Lost & Found",
    location: "2040 Webster St, Oakland, CA 94612",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx2",
    deal_type: "happy_hour",
    price_range: "$$",
    start_time: "16:00:00",
    end_time: "19:00:00",
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  {
    title: "$1 Oysters All Day",
    description: "Fresh oysters for just $1 each, all day every day. Pair with their excellent wine selection.",
    restaurant_name: "The Kebabery",
    location: "44 Webster St, Oakland, CA 94607",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx3",
    deal_type: "happy_hour",
    price_range: "$",
    start_time: "11:00:00",
    end_time: "22:00:00",
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  },
  {
    title: "2-for-1 Wine & Small Plates",
    description: "Buy one glass of wine, get one free. Plus 30% off all small plates. Cozy atmosphere in Temescal.",
    restaurant_name: "Aunt Mary's Cafe",
    location: "4640 Telegraph Ave, Oakland, CA 94609",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx4",
    deal_type: "happy_hour",
    price_range: "$$",
    start_time: "17:00:00",
    end_time: "19:00:00",
    days_available: ["tuesday", "wednesday", "thursday", "friday"],
  },
  {
    title: "$3 Tacos & $4 Margaritas",
    description: "Authentic street tacos for $3 and house margaritas for $4. Can't beat this deal in Fruitvale!",
    restaurant_name: "Tacos Mi Rancho",
    location: "3585 Foothill Blvd, Oakland, CA 94601",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx5",
    deal_type: "happy_hour",
    price_range: "$",
    start_time: "15:00:00",
    end_time: "18:00:00",
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  {
    title: "Half Price Sushi Rolls",
    description: "All sushi rolls 50% off. Fresh fish daily. Popular spot near Piedmont Avenue.",
    restaurant_name: "Genki Crepes & Mini Mart",
    location: "3916 Piedmont Ave, Oakland, CA 94611",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx6",
    deal_type: "happy_hour",
    price_range: "$$",
    start_time: "16:30:00",
    end_time: "18:30:00",
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  {
    title: "$5 Pizza Slices & Beer",
    description: "Giant NY-style pizza slices with any beer for $5. Perfect Jack London Square spot.",
    restaurant_name: "Forge Pizza",
    location: "66 Franklin St, Oakland, CA 94607",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx7",
    deal_type: "happy_hour",
    price_range: "$",
    start_time: "15:00:00",
    end_time: "18:00:00",
    days_available: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  },
  {
    title: "Wine Wednesday - 40% Off Bottles",
    description: "Every Wednesday, take 40% off any bottle of wine. Great selection of natural wines.",
    restaurant_name: "Millennium Restaurant",
    location: "5912 College Ave, Oakland, CA 94618",
    google_place_id: "ChIJVVVVVVV5hYARxxxxxxxx8",
    deal_type: "happy_hour",
    price_range: "$$$",
    start_time: "17:00:00",
    end_time: "22:00:00",
    days_available: ["wednesday"],
  },
]

async function seedDeals() {
  console.log("[v0] Starting to seed happy hour deals...")

  for (const deal of sampleDeals) {
    try {
      const response = await fetch(`${API_URL}/deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deal),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[v0] ✓ Created deal: ${deal.title} at ${deal.restaurant_name}`)
      } else {
        const error = await response.text()
        console.log(`[v0] ✗ Failed to create deal: ${deal.title} - ${error}`)
      }
    } catch (error) {
      console.log(`[v0] ✗ Error creating deal: ${deal.title}`, error)
    }
  }

  console.log("[v0] Finished seeding happy hour deals!")
}

seedDeals()
