"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SentimentChart } from "@/components/sentiment-chart"
import { SentimentSummary } from "@/components/sentiment-summary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TranscriptSummary } from "@/components/transcript-summary"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export function SentimentResults() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("videoId")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!videoId) return

    const fetchResults = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/results?videoId=${videoId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch results")
        }
        const data = await response.json()
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [videoId])

  if (!videoId) return null

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 pb-6">
            <CardTitle>
              <Skeleton className="h-8 w-3/4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/30 overflow-hidden shadow-md">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400 font-medium">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!results) return null

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>
      
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800 pb-6">
          <CardTitle className="text-xl md:text-2xl">Sentiment Analysis Results</CardTitle>
          <CardDescription className="text-base mt-2">Analysis for video: {results.videoTitle}</CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs defaultValue="sentiment" className="w-full">
            <div className="border-b px-6 bg-white dark:bg-gray-850">
              <TabsList className="bg-transparent h-14 w-full justify-start">
                <TabsTrigger value="sentiment" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 px-4">
                  Sentiment Analysis
                </TabsTrigger>
                <TabsTrigger value="transcript" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14 px-4">
                  Transcript Summary
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="sentiment" className="m-0 p-6 pt-8">
              <div className="grid gap-12 lg:grid-cols-2">
                <div className="flex flex-col justify-center">
                  <h2 className="text-lg font-medium mb-4 text-center">Sentiment Distribution</h2>
                  <SentimentChart data={results.sentiment} />
                </div>
                <div>
                  <h2 className="text-lg font-medium mb-4">Analysis Summary</h2>
                  <SentimentSummary data={results} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transcript" className="m-0 p-6">
              <TranscriptSummary transcriptSummary={results.transcriptSummary} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
