// lib/ai/types.ts
// AI 관련 타입 정의

export interface GeminiConfig {
    apiKey: string
    model: string
    maxTokens: number
    timeout: number
    debug: boolean
    rateLimitPerMinute: number
}

export interface APIUsageLog {
    timestamp: Date
    model: string
    inputTokens: number
    outputTokens: number
    latencyMs: number
    success: boolean
    error?: string
}

export interface GenerationRequest {
    prompt: string
    maxTokens?: number
    temperature?: number
    topP?: number
    topK?: number
}

export interface GenerationResponse {
    text: string
    usage?: {
        inputTokens: number
        outputTokens: number
        totalTokens: number
    }
    finishReason?: string
}

export interface HealthCheckResult {
    isHealthy: boolean
    latency?: number
    error?: string
}

