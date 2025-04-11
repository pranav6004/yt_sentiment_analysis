import { YoutubeForm } from "@/components/youtube-form"
import { SentimentResults } from "@/components/sentiment-results"

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
              YouTube Comment Sentiment Analyzer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyze the sentiment of comments on any YouTube video
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <YoutubeForm />
            <SentimentResults />
          </div>
        </div>
      </div>
    </main>
  )
}
