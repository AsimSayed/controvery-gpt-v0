"use client"

import type React from "react"

import { useState } from "react"
import { Bubble } from "@/components/bubble"
import { useStream } from "@/hooks/use-stream"

export function DebateContainer() {
  const [question, setQuestion] = useState("")
  const [conversation, setConversation] = useState<{ type: "pro" | "con" | "you"; text: string }[]>([])
  const { streamText, isStreaming, error } = useStream()

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) return

    setConversation((prev) => [...prev, { type: "you", text: question }])

    let proText = ""
    let conText = ""

    const updateProText = (chunk: string) => {
      proText += chunk
      setConversation((prev) => {
        const existingPro = prev.find((message) => message.type === "pro" && message.text === proText)
        if (existingPro) {
          return prev
        }
        return [...prev.filter((message) => message.type !== "pro"), { type: "pro", text: proText }]
      })
    }

    const updateConText = (chunk: string) => {
      conText += chunk
      setConversation((prev) => {
        const existingCon = prev.find((message) => message.type === "con" && message.text === conText)
        if (existingCon) {
          return prev
        }
        return [...prev.filter((message) => message.type !== "con"), { type: "con", text: conText }]
      })
    }

    const onProComplete = () => {
      streamText("/api/con", question, updateConText, undefined, conversation)
    }

    streamText("/api/pro", question, updateProText, onProComplete, conversation)

    setQuestion("")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Controversy-GPT Debate</h1>
      <div className="mb-4">
        {conversation.map((message, index) => (
          <Bubble
            key={index}
            type={message.type}
            text={message.text}
            isStreaming={isStreaming && message.type !== "you"}
          />
        ))}
        {isStreaming && (
          <>
            <Bubble type="pro" text="" isStreaming={true} />
            <Bubble type="con" text="" isStreaming={true} />
          </>
        )}
      </div>
      <form onSubmit={handleQuestionSubmit} className="flex">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter a controversial question..."
          className="flex-grow border rounded-l-md p-2"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md"
          disabled={isStreaming}
        >
          {isStreaming ? "Debating..." : "Debate!"}
        </button>
      </form>
      {error && <div className="text-red-500 mt-2">Error: {error}</div>}
    </div>
  )
}
