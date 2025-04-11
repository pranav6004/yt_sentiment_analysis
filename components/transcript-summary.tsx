import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface TranscriptSummaryProps {
  transcriptSummary: string
}

export function TranscriptSummary({ transcriptSummary }: TranscriptSummaryProps) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Transcript Summary</h3>
        </div>
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <p className="text-gray-700 dark:text-gray-300">{transcriptSummary}</p>
        </div>
      </CardContent>
    </Card>
  )
}
