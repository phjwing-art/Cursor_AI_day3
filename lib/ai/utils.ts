// lib/ai/utils.ts
// AI 유틸리티 함수

import { APIUsageLog } from './types'

export function estimateTokens(text: string): number {
    // 대략적인 토큰 수 계산 (1 토큰 ≈ 4 문자)
    return Math.ceil(text.length / 4)
}

export function validateTokenLimit(
    inputTokens: number,
    maxTokens: number = 8192
): boolean {
    // 응답용 토큰도 고려하여 여유분 확보
    const reservedTokens = 2000
    return inputTokens <= maxTokens - reservedTokens
}

export function logAPIUsage(log: APIUsageLog): void {
    // 개발 환경에서는 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
        console.log('[Gemini API Usage]', log)
    }

    // 프로덕션에서는 실제 로깅 시스템으로 전송
    // TODO: 로깅 시스템 연동
}

export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error

            // 재시도 불가능한 에러는 즉시 throw
            if (isNonRetryableError(error)) {
                throw error
            }

            if (attempt < maxRetries) {
                await sleep(backoffMs * attempt)
            }
        }
    }

    throw lastError!
}

function isNonRetryableError(error: unknown): boolean {
    // API 키 오류나 콘텐츠 필터링 오류는 재시도 불가
    return (error as Error)?.message?.includes('API key') || 
           (error as Error)?.message?.includes('content policy')
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

