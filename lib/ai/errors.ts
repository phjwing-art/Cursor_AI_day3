// lib/ai/errors.ts
// AI 에러 정의

export enum GeminiErrorType {
    API_KEY_INVALID = 'API_KEY_INVALID',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    TIMEOUT = 'TIMEOUT',
    CONTENT_FILTERED = 'CONTENT_FILTERED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN = 'UNKNOWN'
}

export class GeminiError extends Error {
    constructor(
        public type: GeminiErrorType,
        message: string,
        public originalError?: unknown
    ) {
        super(message)
        this.name = 'GeminiError'
    }
}

export function isNonRetryableError(error: unknown): boolean {
    if (error instanceof GeminiError) {
        return [
            GeminiErrorType.API_KEY_INVALID,
            GeminiErrorType.CONTENT_FILTERED
        ].includes(error.type)
    }
    return false
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

