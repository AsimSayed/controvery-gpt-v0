import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function* debateStream(stance: "pro" | "con", question: string) {
  const systemPrompt =
    stance === "pro"
      ? "You are a policy expert tasked with presenting the strongest PRO argument. Be persuasive, factual, and compelling. Keep responses under 200 words."
      : "You are a policy expert tasked with presenting the strongest CON argument. Be persuasive, factual, and compelling. Keep responses under 200 words."

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    stream: true,
    temperature: 0.8,
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) yield delta
  }
}
