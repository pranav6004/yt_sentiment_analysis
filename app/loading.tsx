export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-red-600"></div>
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  )
}
