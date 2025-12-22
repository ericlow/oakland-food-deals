import { NextResponse } from "next/server"

export async function GET() {
  // Server-side only - API key never exposed to client
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  return NextResponse.json({ apiKey })
}
