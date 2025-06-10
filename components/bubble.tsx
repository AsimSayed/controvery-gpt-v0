"use client"

import { useEffect, useRef } from "react"

interface BubbleProps {
  text: string
  type: "pro" | "con" | "you"
  isStreaming?: boolean
}

export function Bubble({ text, type, isStreaming = false }: BubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bubbleRef.current) {
      bubbleRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [text])

  const getBubbleStyles = () => {
    switch (type) {
      case "pro":
        return "bg-green-50 border-green-200 text-green-900 ml-0 mr-12"
      case "con":
        return "bg-red-50 border-red-200 text-red-900 ml-12 mr-0"
      case "you":
        return "bg-blue-50 border-blue-200 text-blue-900 ml-4 mr-4"
      default:
        return "bg-gray-100 border-gray-300 text-gray-800"
    }
  }

  const getLabel = () => {
    switch (type) {
      case "pro":
        return "🟢 Alex (Pro)"
      case "con":
        return "🔴 Jordan (Con)"
      case "you":
        return "🔵 You"
      default:
        return ""
    }
  }

  return (
    <div ref={bubbleRef} className={`mb-4 ${getBubbleStyles()}`}>
      <div className="border rounded-2xl p-4 shadow-sm">
        <div className="text-xs font-semibold mb-2 opacity-70">{getLabel()}</div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
          {isStreaming && <span className="inline-block w-2 h-4 bg-current opacity-50 animate-pulse ml-1" />}
        </div>
      </div>
    </div>
  )
}
