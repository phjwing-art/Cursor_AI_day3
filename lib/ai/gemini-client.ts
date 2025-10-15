// lib/ai/gemini-client.ts
// Gemini API 클라이언트

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiConfig } from './config'
import { GeminiError, GeminiErrorType } from './errors'
import { 
    GenerationRequest, 
    GenerationResponse, 
    HealthCheckResult 
} from './types'
import { 
    estimateTokens, 
    validateTokenLimit, 
    logAPIUsage, 
    withRetry 
} from './utils'

export class GeminiClient {
    private client: GoogleGenerativeAI
    private config: ReturnType<typeof getGeminiConfig>

    constructor() {
        this.config = getGeminiConfig()
        this.client = new GoogleGenerativeAI(this.config.apiKey)
    }

    async healthCheck(): Promise<HealthCheckResult> {
        const startTime = Date.now()
        
        try {
            const result = await this.generateText({ prompt: 'Hello' })
            const latency = Date.now() - startTime
            
            return {
                isHealthy: !!result.text,
                latency
            }
        } catch (error) {
            const latency = Date.now() - startTime
            console.error('Gemini health check failed:', error)
            
            return {
                isHealthy: false,
                latency,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    async generateText(request: GenerationRequest): Promise<GenerationResponse> {
        const startTime = Date.now()
        
        try {
            // 토큰 수 검증
            const inputTokens = estimateTokens(request.prompt)
            if (!validateTokenLimit(inputTokens, this.config.maxTokens)) {
                throw new GeminiError(
                    GeminiErrorType.QUOTA_EXCEEDED,
                    'Input text exceeds token limit'
                )
            }

            const response = await withRetry(async () => {
                console.log('Gemini API 호출 시작:', {
                    model: this.config.model,
                    promptLength: request.prompt.length,
                    maxTokens: request.maxTokens || this.config.maxTokens
                })
                
                // Google Generative AI 올바른 사용법
                const model = this.client.getGenerativeModel({ 
                    model: this.config.model,
                    generationConfig: {
                        maxOutputTokens: request.maxTokens || this.config.maxTokens,
                        temperature: request.temperature || 0.7,
                        topP: request.topP || 0.9,
                        topK: request.topK || 40
                    }
                })
                
                const result = await model.generateContent(request.prompt)
                return result.response
            })

            const latency = Date.now() - startTime
            const responseText = response.text() || ''
            const outputTokens = estimateTokens(responseText)

            // 사용량 로깅
            logAPIUsage({
                timestamp: new Date(),
                model: this.config.model,
                inputTokens,
                outputTokens,
                latencyMs: latency,
                success: true
            })

            return {
                text: responseText,
                usage: {
                    inputTokens,
                    outputTokens,
                    totalTokens: inputTokens + outputTokens
                },
                finishReason: response.candidates?.[0]?.finishReason
            }
        } catch (error) {
            const latency = Date.now() - startTime
            
            // 사용량 로깅 (실패)
            logAPIUsage({
                timestamp: new Date(),
                model: this.config.model,
                inputTokens: estimateTokens(request.prompt),
                outputTokens: 0,
                latencyMs: latency,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })

            throw this.handleError(error)
        }
    }

    async generateTextStream(request: GenerationRequest): Promise<AsyncIterable<string>> {
        try {
            const model = this.client.getGenerativeModel({
                model: this.config.model,
                generationConfig: {
                    maxOutputTokens: request.maxTokens || this.config.maxTokens,
                    temperature: request.temperature || 0.7,
                    topP: request.topP || 0.9,
                    topK: request.topK || 40
                }
            })

            const response = await model.generateContentStream(request.prompt)
            return response as unknown as AsyncIterable<string>
        } catch (error) {
            throw this.handleError(error)
        }
    }

    private handleError(error: unknown): GeminiError {
        if (error instanceof GeminiError) {
            return error
        }

        const message = (error as Error)?.message || 'Unknown error'
        
        // 에러 타입 분류
        if (message.includes('API key') || message.includes('authentication')) {
            return new GeminiError(
                GeminiErrorType.API_KEY_INVALID,
                'Invalid API key',
                error
            )
        }
        
        if (message.includes('quota') || message.includes('rate limit')) {
            return new GeminiError(
                GeminiErrorType.QUOTA_EXCEEDED,
                'API quota exceeded',
                error
            )
        }
        
        if (message.includes('timeout')) {
            return new GeminiError(
                GeminiErrorType.TIMEOUT,
                'Request timeout',
                error
            )
        }
        
        if (message.includes('content policy') || message.includes('safety')) {
            return new GeminiError(
                GeminiErrorType.CONTENT_FILTERED,
                'Content filtered by safety policy',
                error
            )
        }
        
        if (message.includes('network') || message.includes('connection')) {
            return new GeminiError(
                GeminiErrorType.NETWORK_ERROR,
                'Network error',
                error
            )
        }

        return new GeminiError(
            GeminiErrorType.UNKNOWN,
            message,
            error
        )
    }
}
