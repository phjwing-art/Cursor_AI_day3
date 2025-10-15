// lib/notes/actions.ts
// 노트 관련 서버 액션들

import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai'
import { estimateTokens, validateTokenLimit } from '@/lib/ai/utils'
import { GeminiError, GeminiErrorType } from '@/lib/ai/errors'

// 요약 생성 서버 액션
export async function generateSummary(noteId: string) {
    try {
        const supabase = await createClient()
        
        // 사용자 인증 확인
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return {
                success: false,
                error: '인증이 필요합니다.'
            }
        }

        // 노트 조회
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single()

        if (noteError || !note) {
            return {
                success: false,
                error: '노트를 찾을 수 없습니다.'
            }
        }

        // 노트 내용 검증 (100자 이상)
        if (!note.content || note.content.length < 100) {
            return {
                success: false,
                error: '노트 내용이 100자 이상이어야 요약을 생성할 수 있습니다.'
            }
        }

        // 토큰 수 검증
        const inputTokens = estimateTokens(note.content)
        if (!validateTokenLimit(inputTokens)) {
            return {
                success: false,
                error: '노트가 너무 길어서 요약을 생성할 수 없습니다.'
            }
        }

        // Gemini API 호출
        let result
        try {
            // 환경 변수 직접 확인
            console.log('서버 액션에서 환경 변수 확인:', {
                GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '없음',
                NODE_ENV: process.env.NODE_ENV
            })
            
            // 환경 변수가 없으면 직접 설정
            if (!process.env.GEMINI_API_KEY) {
                console.log('환경 변수 직접 설정...')
                process.env.GEMINI_API_KEY = 'AIzaSyCZyyz1kkLoEwrBgDs0Kb30LX8bbpxTLNI'
                process.env.GEMINI_MODEL = 'gemini-2.0-flash-001'
                process.env.GEMINI_MAX_TOKENS = '8192'
                process.env.GEMINI_TIMEOUT_MS = '10000'
                process.env.GEMINI_DEBUG = 'true'
                console.log('환경 변수 설정 후:', {
                    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '없음'
                })
            }
            
            const geminiClient = new GeminiClient()
            
            const summaryPrompt = `
다음 노트 내용을 3-6개의 불릿 포인트로 요약해주세요.
요약은 핵심 내용만 간결하게 정리하고, 한국어로 작성해주세요.

노트 내용:
${note.content}

요약:
`

            console.log('요약 생성 시작:', { noteId, contentLength: note.content.length })
            
            result = await geminiClient.generateText({
                prompt: summaryPrompt,
                maxTokens: 1000,
                temperature: 0.7
            })

            console.log('Gemini API 응답:', { success: true, textLength: result.text.length })
            
        } catch (apiError) {
            console.error('Gemini API 호출 실패:', apiError)
            return {
                success: false,
                error: `AI 요약 생성에 실패했습니다: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`
            }
        }

        // 요약 결과 저장
        console.log('요약 저장 시작:', { noteId, contentLength: result.text.length })
        
        const { error: insertError } = await supabase
            .from('summaries')
            .insert({
                note_id: noteId,
                model: 'gemini-2.0-flash-001',
                content: result.text
            })

        if (insertError) {
            console.error('요약 저장 실패:', insertError)
            return {
                success: false,
                error: `요약 저장 중 오류가 발생했습니다: ${insertError.message}`
            }
        }
        
        console.log('요약 저장 성공')

        // 페이지 캐시 무효화 (서버 컴포넌트에서만 실행)
        if (typeof window === 'undefined') {
            const { revalidatePath } = await import('next/cache')
            revalidatePath(`/notes/${noteId}`)
            revalidatePath('/notes')
        }

        return {
            success: true,
            summary: result.text,
            usage: result.usage
        }

    } catch (error) {
        console.error('요약 생성 실패:', error)
        
        if (error instanceof GeminiError) {
            switch (error.type) {
                case GeminiErrorType.QUOTA_EXCEEDED:
                    return {
                        success: false,
                        error: 'API 사용량을 초과했습니다. 잠시 후 다시 시도해주세요.'
                    }
                case GeminiErrorType.TIMEOUT:
                    return {
                        success: false,
                        error: '요약 생성 시간이 초과되었습니다. 다시 시도해주세요.'
                    }
                case GeminiErrorType.API_KEY_INVALID:
                    return {
                        success: false,
                        error: 'API 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
                    }
                default:
                    return {
                        success: false,
                        error: '요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
                    }
            }
        }

        return {
            success: false,
            error: '요약 생성 중 오류가 발생했습니다.'
        }
    }
}

// 요약 재생성 서버 액션
export async function regenerateSummary(noteId: string) {
    try {
        const supabase = await createClient()
        
        // 사용자 인증 확인
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return {
                success: false,
                error: '인증이 필요합니다.'
            }
        }

        // 기존 요약 삭제
        await supabase
            .from('summaries')
            .delete()
            .eq('note_id', noteId)

        // 새 요약 생성
        return await generateSummary(noteId)

    } catch (error) {
        console.error('요약 재생성 실패:', error)
        return {
            success: false,
            error: '요약 재생성 중 오류가 발생했습니다.'
        }
    }
}

// 노트의 요약 조회
export async function getNoteSummary(noteId: string) {
    try {
        const supabase = await createClient()
        
        // 사용자 인증 확인
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return null
        }

        // 요약 조회
        const { data: summary, error: summaryError } = await supabase
            .from('summaries')
            .select('*')
            .eq('note_id', noteId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (summaryError) {
            return null
        }

        return summary

    } catch (error) {
        console.error('요약 조회 실패:', error)
        return null
    }
}