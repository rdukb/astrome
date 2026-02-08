'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error)
  }, [error])

  const isNetworkError = error.message.includes('fetch') ||
                         error.message.includes('network') ||
                         error.message.includes('ERR_') ||
                         error.message.includes('offline')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 flex items-center justify-center">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="text-6xl mb-4">
          {isNetworkError ? '📡' : '⚠️'}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isNetworkError ? 'Connection Issue' : 'Something Went Wrong'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isNetworkError
            ? 'Unable to connect to the server. Please check your internet connection and try again.'
            : 'An unexpected error occurred while loading the Panchang data. This has been logged for investigation.'
          }
        </p>

        {error.message && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-mono text-gray-700 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Go Home
          </Button>
        </div>

        {isNetworkError && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Offline Features
            </h3>
            <p className="text-xs text-gray-600">
              Once you reconnect, previously viewed Panchang data will be available offline.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
