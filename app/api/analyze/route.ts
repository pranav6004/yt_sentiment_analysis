import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { videoId, url } = await request.json()

    if (!videoId && !url) {
      return NextResponse.json({ message: "Video ID or URL is required" }, { status: 400 })
    }

    // Connect to our Flask backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    console.log(`Sending analysis request to: ${backendUrl}/api/analyze`)

    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ videoId, url }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error("Backend error:", errorData)
      
      // Check if it's an API quota exceeded error
      if (errorData.apiQuotaExceeded) {
        return NextResponse.json(
          { message: "OpenAI API quota exceeded. Please try again later or check your API key.", apiQuotaExceeded: true },
          { status: 429 }
        )
      }
      
      return NextResponse.json({ message: errorData.error || "Failed to process video" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in analyze API:", error)
    return NextResponse.json({ message: "Failed to process video" }, { status: 500 })
  }
}
