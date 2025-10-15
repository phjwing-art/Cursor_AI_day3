// app/api/ai/stream/route.ts
// Gemini API 스트리밍 텍스트 생성 엔드포인트

import { NextRequest } from 'next/server'
import { GeminiClient } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json()
        
        if (!prompt || typeof prompt !== 'string') {
            return new Response(
                JSON.stringify({ error: 'Prompt is required and must be a string' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        const client = new GeminiClient()
        const stream = await client.generateTextStream({ prompt })
        
        const encoder = new TextEncoder()
        
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        if (typeof chunk === 'string') {
                            const data = JSON.stringify({ text: chunk })
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                        } else if (chunk && typeof chunk === 'object' && 'text' in chunk) {
                            const data = JSON.stringify({ text: (chunk as { text: string }).text })
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    controller.close()
                } catch (error) {
                    console.error('Streaming error:', error)
                    const errorData = JSON.stringify({ 
                        error: error instanceof Error ? error.message : 'Unknown error' 
                    })
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
                    controller.close()
                }
            }
        })

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('Stream setup error:', error)
        
        return new Response(
            JSON.stringify({ 
                error: error instanceof Error ? error.message : 'Unknown error' 
            }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}

