// lib/ai/config.ts
// AI 설정 관리

import { GeminiConfig } from './types'

export function getGeminiConfig(): GeminiConfig {
    // 환경 변수 디버깅
    console.log('환경 변수 확인:', {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '없음',
        GEMINI_MODEL: process.env.GEMINI_MODEL,
        NODE_ENV: process.env.NODE_ENV
    })

    const config: GeminiConfig = {
        apiKey: process.env.GEMINI_API_KEY!,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192'),
        timeout: parseInt(process.env.GEMINI_TIMEOUT_MS || '10000'),
        debug: process.env.GEMINI_DEBUG === 'true',
        rateLimitPerMinute: parseInt(process.env.GEMINI_RATE_LIMIT || '60')
    }

    // 필수 설정 검증
    if (!config.apiKey) {
        console.error('GEMINI_API_KEY가 설정되지 않았습니다.')
        console.error('사용 가능한 환경 변수:', Object.keys(process.env).filter(key => key.includes('GEMINI')))
        throw new Error('GEMINI_API_KEY is required')
    }

    return config
}

