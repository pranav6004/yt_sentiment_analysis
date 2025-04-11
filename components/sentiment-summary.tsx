"use client"

import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, Minus, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SentimentSummaryProps {
  data: {
    sentiment: {
      positive: number
      negative: number
      neutral: number
    }
    videoTitle?: string
    channelTitle?: string
    commentCount?: number
    summary?: string
    transcriptSummary?: string
    apiQuotaExceeded?: boolean
  }
}

export function SentimentSummary({ data }: SentimentSummaryProps) {
  const { sentiment, videoTitle, channelTitle, commentCount, summary, transcriptSummary, apiQuotaExceeded } = data
  
  // Ensure sentiment values are valid
  const validSentiment = {
    positive: Number.isFinite(sentiment?.positive) ? sentiment.positive : 0,
    negative: Number.isFinite(sentiment?.negative) ? sentiment.negative : 0,
    neutral: Number.isFinite(sentiment?.neutral) ? sentiment.neutral : 0,
  }
  
  const total = validSentiment.positive + validSentiment.negative + validSentiment.neutral

  const getDominantSentiment = () => {
    const max = Math.max(validSentiment.positive, validSentiment.negative, validSentiment.neutral)
    if (max === validSentiment.positive) return "positive"
    if (max === validSentiment.negative) return "negative"
    return "neutral"
  }

  const dominantSentiment = getDominantSentiment()

  // Get sentiment color
  const getSentimentColor = (type: string) => {
    if (type === 'positive') return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/30' };
    if (type === 'negative') return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800/30' };
    return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/30' };
  };

  return (
    <div className="space-y-6 rounded-xl bg-white dark:bg-gray-800/50 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      {apiQuotaExceeded && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            OpenAI API quota exceeded. Some analysis results may be incomplete.
          </AlertDescription>
        </Alert>
      )}
    
      <div className="grid gap-4 sm:grid-cols-2">
        {videoTitle && (
          <div className="sm:col-span-2">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Video Title</h3>
            <p className="font-medium mt-1 text-gray-900 dark:text-gray-100">{videoTitle}</p>
          </div>
        )}
        
        {channelTitle && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Channel</h3>
            <p className="font-medium mt-1 text-gray-900 dark:text-gray-100">{channelTitle}</p>
          </div>
        )}

        {commentCount !== undefined && (
          <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Comments Analyzed</h3>
            <p className="font-medium mt-1 text-gray-900 dark:text-gray-100">{commentCount}</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-3">Sentiment Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-[#FDCA40]" />
              <span className="font-medium">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-[#FDCA40] h-2.5 rounded-full" 
                  style={{ width: `${total > 0 ? (validSentiment.positive / total) * 100 : 0}%` }}
                ></div>
              </div>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 ml-2 min-w-[48px] text-center"
              >
                {total > 0 ? ((validSentiment.positive / total) * 100).toFixed(1) : "0.0"}%
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-[#F94144]" />
              <span className="font-medium">Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-[#F94144] h-2.5 rounded-full" 
                  style={{ width: `${total > 0 ? (validSentiment.negative / total) * 100 : 0}%` }}
                ></div>
              </div>
              <Badge 
                variant="outline" 
                className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 ml-2 min-w-[48px] text-center"
              >
                {total > 0 ? ((validSentiment.negative / total) * 100).toFixed(1) : "0.0"}%
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-[#4EA8DE]" />
              <span className="font-medium">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-[#4EA8DE] h-2.5 rounded-full" 
                  style={{ width: `${total > 0 ? (validSentiment.neutral / total) * 100 : 0}%` }}
                ></div>
              </div>
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 ml-2 min-w-[48px] text-center"
              >
                {total > 0 ? ((validSentiment.neutral / total) * 100).toFixed(1) : "0.0"}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">Overall Sentiment</h3>
        <Badge
          className={`mt-1 text-sm px-3 py-1 ${
            dominantSentiment === "positive"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
              : dominantSentiment === "negative"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          }`}
        >
          {dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)}
        </Badge>
      </div>

      {summary && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Comment Analysis
          </h3>
          <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-700">{summary}</p>
        </div>
      )}
    </div>
  )
}
