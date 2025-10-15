// __tests__/ai/utils.test.ts
// AI 유틸리티 함수 테스트

import { describe, test, expect } from '@jest/globals'
import { estimateTokens, validateTokenLimit } from '../../lib/ai/utils'

describe('AI Utils', () => {
    describe('estimateTokens', () => {
        test('should estimate tokens correctly', () => {
            const text = 'Hello, world!'
            const tokens = estimateTokens(text)
            expect(tokens).toBeGreaterThan(0)
            expect(tokens).toBe(Math.ceil(text.length / 4))
        })

        test('should handle empty string', () => {
            expect(estimateTokens('')).toBe(0)
        })

        test('should handle long text', () => {
            const longText = 'a'.repeat(10000)
            expect(estimateTokens(longText)).toBe(2500)
        })
    })

    describe('validateTokenLimit', () => {
        test('should validate within token limit', () => {
            expect(validateTokenLimit(1000, 8192)).toBe(true)
        })

        test('should reject exceeding token limit', () => {
            expect(validateTokenLimit(7000, 8192)).toBe(false)
        })

        test('should use default max tokens', () => {
            expect(validateTokenLimit(5000)).toBe(true)
            expect(validateTokenLimit(7000)).toBe(false)
        })
    })
})

