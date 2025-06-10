# Controversy-GPT Demo

A live debate platform that uses OpenAI to generate Pro and Con arguments for any controversial topic in real-time.

## Features

- 🔥 Real-time streaming debates using OpenAI
- 🟢 Pro arguments with compelling evidence
- 🔴 Con arguments with counter-perspectives  
- 🔵 User comments and thoughts
- ⚡ Edge runtime for low latency
- 📱 Responsive design with Tailwind CSS

## Quick Start

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Environment Variables

Create a `.env.local` file:

\`\`\`env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
\`\`\`

## Deployment

Deploy to Vercel with one click. Make sure to add your environment variables in the Vercel dashboard under Project Settings → Environment Variables.

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **API**: Edge runtime for streaming OpenAI responses
- **Streaming**: Custom hooks for real-time text streaming
- **Components**: Modular bubble system for different argument types

## Future Enhancements

- [ ] Persist chat history to Supabase
- [ ] Add rate limiting with Upstash
- [ ] Support follow-up questions with context
- [ ] Add topic suggestions
- [ ] Implement user authentication
- [ ] Add debate scoring system

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API
- Vercel Edge Runtime
\`\`\`

Finally, let's create the environment variables template:
