// app/api/ai/health/route.ts
// Gemini API 헬스체크 엔드포인트

import { NextResponse } from 'next/server'
import { GeminiClient } from '@/lib/ai'

export async function GET() {
    try {
        const client = new GeminiClient()
        const result = await client.healthCheck()
        
        return NextResponse.json({
            success: result.isHealthy,
            latency: result.latency,
            error: result.error,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
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

