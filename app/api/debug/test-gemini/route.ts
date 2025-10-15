// app/api/debug/test-gemini/route.ts
// Gemini API 테스트 엔드포인트

import { NextResponse } from 'next/server'
import { GeminiClient } from '@/lib/ai'

export async function GET() {
    try {
        console.log('Gemini API 테스트 시작')
        
        const geminiClient = new GeminiClient()
        
        // 헬스체크
        console.log('헬스체크 실행 중...')
        const healthResult = await geminiClient.healthCheck()
        console.log('헬스체크 결과:', healthResult)
        
        if (!healthResult.isHealthy) {
            return NextResponse.json({
                success: false,
                error: 'Gemini API 헬스체크 실패',
                details: healthResult
            }, { status: 500 })
        }
        
        // 간단한 텍스트 생성 테스트
        console.log('텍스트 생성 테스트 시작...')
        let testResult
        try {
            testResult = await geminiClient.generateText({
                prompt: '안녕하세요. 간단한 인사말을 해주세요.',
                maxTokens: 100,
                temperature: 0.7
            })
            
            console.log('텍스트 생성 결과:', testResult)
        } catch (textError) {
            console.error('텍스트 생성 실패:', textError)
            throw textError
        }
        
        return NextResponse.json({
            success: true,
            message: 'Gemini API 테스트 성공',
            healthCheck: healthResult,
            testResult: testResult
        })
        
    } catch (error) {
        console.error('Gemini API 테스트 실패:', error)
        return NextResponse.json({
            success: false,
            error: 'Gemini API 테스트 실패',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 })
    }
}
