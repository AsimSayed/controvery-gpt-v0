"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bubble } from "./bubble"
import { useStream } from "@/hooks/use-stream"

interface Message {
  id: string
  text: string
  type: "pro" | "con" | "you"
  isStreaming?: boolean
}

export function DebateContainer() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [comment, setComment] = useState("")
  const [isDebating, setIsDebating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { streamText } = useStream()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startDebate = async () => {
    if (!question.trim() || isDebating) return

    setIsDebating(true)
    setMessages([])

    // Create initial streaming messages
    const proId = `pro-${Date.now()}`
    const conId = `con-${Date.now()}`

    setMessages([
      { id: proId, text: "", type: "pro", isStreaming: true },
      { id: conId, text: "", type: "con", isStreaming: true },
    ])

    // Stream Pro argument
    streamText(
      "/api/pro",
      question,
      (chunk) => {
        setMessages((prev) => prev.map((msg) => (msg.id === proId ? { ...msg, text: msg.text + chunk } : msg)))
      },
      () => {
        setMessages((prev) => prev.map((msg) => (msg.id === proId ? { ...msg, isStreaming: false } : msg)))
      },
    )

    // Stream Con argument
    streamText(
      "/api/con",
      question,
      (chunk) => {
        setMessages((prev) => prev.map((msg) => (msg.id === conId ? { ...msg, text: msg.text + chunk } : msg)))
      },
      () => {
        setMessages((prev) => prev.map((msg) => (msg.id === conId ? { ...msg, isStreaming: false } : msg)))
        setIsDebating(false)
      },
    )
  }

  const addComment = () => {
    if (!comment.trim()) return

    const newMessage: Message = {
      id: `you-${Date.now()}`,
      text: comment,
      type: "you",
    }

    setMessages((prev) => [...prev.slice(-39), newMessage]) // Keep last 40 messages
    setComment("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addComment()
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-xl rounded-2xl min-h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-xl font-bold text-gray-800">🔥 Controversy-GPT</CardTitle>
        <div className="flex gap-2 mt-4">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter a controversial topic..."
            className="flex-1 border-b outline-none placeholder:italic"
            onKeyPress={(e) => e.key === "Enter" && startDebate()}
          />
          <Button onClick={startDebate} disabled={!question.trim() || isDebating} className="px-6">
            {isDebating ? "Debating..." : "Debate"}
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto max-h-96 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">🤔</p>
            <p className="text-sm">Enter a topic to see both sides argue!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <Bubble key={message.id} text={message.text} type={message.type} isStreaming={message.isStreaming} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Comment Box */}
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your thoughts..."
            className="flex-1 min-h-[60px] resize-none"
            onKeyPress={handleKeyPress}
          />
          <Button onClick={addComment} disabled={!comment.trim()} className="self-end">
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
