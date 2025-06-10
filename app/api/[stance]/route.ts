import { conversationStream } from "@/lib/openai"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest, { params }: { params: { stance: "pro" | "con" } }) {
  try {
    const { question, conversationHistory = [] } = await req.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const token of conversationStream(params.stance, question, conversationHistory)) {
            controller.enqueue(encoder.encode(token))
          }
          controller.close()
        } catch (error) {
          console.error(`Error in ${params.stance} stream:`, error)
          controller.error(error)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
