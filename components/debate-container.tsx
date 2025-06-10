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

interface ConversationMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export function DebateContainer() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [comment, setComment] = useState("")
  const [isDebating, setIsDebating] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [currentTurn, setCurrentTurn] = useState<"pro" | "con">("pro")
  const [turnCount, setTurnCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { streamText } = useStream()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addToConversationHistory = (role: "user" | "assistant", content: string) => {
    setConversationHistory((prev) => [...prev, { role, content }])
  }

  const takeTurn = async (stance: "pro" | "con") => {
    const messageId = `${stance}-${Date.now()}`

    // Add streaming message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        text: "",
        type: stance,
        isStreaming: true,
      },
    ])

    let fullMessage = ""

    await streamText(
      `/api/${stance}`,
      question,
      (chunk) => {
        fullMessage += chunk
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, text: fullMessage } : msg)))
      },
      () => {
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isStreaming: false } : msg)))

        // Add to conversation history
        addToConversationHistory("assistant", fullMessage)

        // Continue conversation
        const nextTurnCount = turnCount + 1
        setTurnCount(nextTurnCount)

        if (nextTurnCount < 6) {
          // 3 back-and-forth exchanges (6 total messages)
          const nextStance = stance === "pro" ? "con" : "pro"
          setCurrentTurn(nextStance)

          // Small delay for natural conversation flow
          setTimeout(() => {
            takeTurn(nextStance)
          }, 1500)
        } else {
          setIsDebating(false)
        }
      },
    )
  }

  const startDebate = async () => {
    if (!question.trim() || isDebating) return

    setIsDebating(true)
    setMessages([])
    setConversationHistory([])
    setCurrentTurn("pro")
    setTurnCount(0)

    // Start with Pro
    takeTurn("pro")
  }

  const addComment = () => {
    if (!comment.trim()) return

    const newMessage: Message = {
      id: `you-${Date.now()}`,
      text: comment,
      type: "you",
    }

    setMessages((prev) => [...prev.slice(-39), newMessage])
    setComment("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addComment()
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-xl rounded-2xl min-h-[700px] flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-bold text-gray-800">🔥 Controversy Podcast</CardTitle>
        <p className="text-center text-sm text-gray-600 mb-4">Watch Alex and Jordan debate any topic in real-time</p>

        {/* Topic suggestion */}
        <div className="text-center mb-4 text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 inline-flex items-center gap-1">
            <span className="text-xs">Try:</span>{" "}
            <span className="font-medium">
              {
                [
                  "Should social media be regulated?",
                  "Is AI a threat to humanity?",
                  "Should college be free?",
                  "Is remote work better than office work?",
                  "Should voting be mandatory?",
                  "Is nuclear energy the future?",
                  "Should billionaires exist?",
                  "Are cryptocurrencies a good investment?",
                  "Should we colonize Mars?",
                  "Is a four-day work week better?",
                  "Should self-driving cars be legal?",
                  "Is universal basic income a good idea?",
                ][Math.floor(Math.random() * 12)]
              }
            </span>
          </span>
        </div>

        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter a topic for Alex and Jordan to debate..."
            className="flex-1 border-b outline-none placeholder:italic"
            onKeyPress={(e) => e.key === "Enter" && startDebate()}
          />
          <Button onClick={startDebate} disabled={!question.trim() || isDebating} className="px-6">
            {isDebating ? "Live..." : "Start Podcast"}
          </Button>
        </div>

        {isDebating && (
          <div className="text-center mt-2">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              {currentTurn === "pro" ? "Alex" : "Jordan"} is speaking... ({Math.floor(turnCount / 2) + 1}/3 exchanges)
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto max-h-96 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-4xl mb-4">🎙️</p>
            <p className="text-lg font-medium">Ready to start the podcast?</p>
            <p className="text-sm">Alex and Jordan will have a 3-round debate on your topic</p>
          </div>
        ) : (
          <div className="space-y-3">
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
            placeholder="Join the conversation..."
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
