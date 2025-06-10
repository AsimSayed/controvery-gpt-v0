import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ConversationMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function* conversationStream(
  stance: "pro" | "con",
  question: string,
  conversationHistory: ConversationMessage[] = [],
) {
  const personas = {
    pro: {
      name: "Alex",
      personality:
        "You are Alex, an optimistic policy advocate. You're articulate, passionate, and always find the positive angles. Keep responses conversational, 2-3 sentences max. Reference what your debate partner just said.",
    },
    con: {
      name: "Jordan",
      personality:
        "You are Jordan, a pragmatic policy critic. You're thoughtful, analytical, and point out potential problems. Keep responses conversational, 2-3 sentences max. Reference what your debate partner just said.",
    },
  }

  const systemPrompt = `${personas[stance].personality}

Topic: ${question}

This is a friendly podcast-style debate. Be conversational, engaging, and respectful. Always acknowledge your debate partner's points before making your own.`

  const messages: ConversationMessage[] = [{ role: "system", content: systemPrompt }, ...conversationHistory]

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    stream: true,
    temperature: 0.9,
    max_tokens: 150,
    messages,
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
