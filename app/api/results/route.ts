import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get("videoId")

    if (!videoId) {
      return NextResponse.json({ message: "Video ID is required" }, { status: 400 })
    }

    // Connect to our Flask backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    console.log(`Fetching results from: ${backendUrl}/api/results?videoId=${videoId}`)

    const response = await fetch(`${backendUrl}/api/results?videoId=${videoId}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error("Backend error:", errorData)
      return NextResponse.json({ message: errorData.error || "Failed to fetch results" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in results API:", error)
    return NextResponse.json({ message: "Failed to fetch results" }, { status: 500 })
  }
}
