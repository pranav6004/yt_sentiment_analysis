import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SentimentChart } from "@/components/sentiment-chart"
import { SentimentSummary } from "@/components/sentiment-summary"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getVideoResults(videoId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/results?videoId=${videoId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch results")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching video results:", error)
    return null
  }
}

export default async function ResultsPage({ params }: { params: { videoId: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const videoId = resolvedParams.videoId;
  
  const results = await getVideoResults(videoId)

  if (!results) {
    notFound()
  }

  const hasSentimentData = results.sentiment && 
    (results.sentiment.positive > 0 || 
     results.sentiment.negative > 0 || 
     results.sentiment.neutral > 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Sentiment Analysis Results
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analysis for video: {results.videoTitle || videoId}
            </p>
          </div>

          <Card className="rounded-xl bg-white shadow-lg dark:bg-gray-800">
            <CardContent className="p-6">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="mb-4 text-xl font-semibold">Sentiment Distribution</h2>
                    {hasSentimentData ? (
                      <SentimentChart data={results.sentiment} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50 dark:bg-gray-900">
                        <p className="text-center text-gray-500">No sentiment data available</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="mb-4 text-xl font-semibold">Analysis Summary</h2>
                    <SentimentSummary data={results} />
                  </div>
                </div>
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
