"use client"

import { useState, useCallback } from "react"

export function useStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamText = useCallback(
    async (
      url: string,
      question: string,
      onChunk: (chunk: string) => void,
      onComplete?: () => void,
      conversationHistory?: any[],
    ) => {
      setIsStreaming(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, conversationHistory }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No reader available")
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          onChunk(chunk)
        }

        onComplete?.()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsStreaming(false)
      }
    },
    [],
  )

  return { streamText, isStreaming, error }
}
