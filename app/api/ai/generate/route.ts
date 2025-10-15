// app/api/ai/generate/route.ts
// Gemini API 텍스트 생성 엔드포인트

import { NextRequest, NextResponse } from 'next/server'
import { GeminiClient } from '@/lib/ai'

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json()
        
        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required and must be a string' },
                { status: 400 }
            )
        }

        const client = new GeminiClient()
        const result = await client.generateText({ prompt })
        
        return NextResponse.json({
            success: true,
            text: result.text,
            usage: result.usage,
            finishReason: result.finishReason,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Text generation error:', error)
        
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}

