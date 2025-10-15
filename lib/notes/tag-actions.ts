// lib/notes/tag-actions.ts
// 태그 관련 서버 액션들

import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai'
import { estimateTokens, validateTokenLimit } from '@/lib/ai/utils'
// import { GeminiError, GeminiErrorType } from '@/lib/ai/errors'

// 태그 생성 서버 액션
export async function generateTags(noteId: string) {
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
                error: '노트 내용이 100자 이상이어야 태그를 생성할 수 있습니다.'
            }
        }

        // 토큰 수 검증
        const inputTokens = estimateTokens(note.content)
        if (!validateTokenLimit(inputTokens)) {
            return {
                success: false,
                error: '노트가 너무 길어서 태그를 생성할 수 없습니다.'
            }
        }

        // Gemini API 호출
        let result: { text: string; usage?: unknown; finishReason?: unknown }
        try {
            // 환경 변수 직접 확인
            console.log('태그 생성 서버 액션에서 환경 변수 확인:', {
                GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '없음',
                NODE_ENV: process.env.NODE_ENV
            })

            // 환경 변수가 없으면 직접 설정 (임시 방편)
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

            const tagPrompt = `
다음 노트 내용을 분석하여 관련성 높은 태그를 최대 6개까지 생성해주세요.
태그는 한국어로 작성하고, 노트의 핵심 주제와 키워드를 반영해주세요.

노트 내용:
${note.content}

태그 (쉼표로 구분):
`

            console.log('태그 생성 시작:', { noteId, contentLength: note.content.length })

            result = await geminiClient.generateText({
                prompt: tagPrompt,
                maxTokens: 500,
                temperature: 0.7
            })

            console.log('Gemini API 응답:', { success: true, textLength: result.text.length })

        } catch (apiError) {
            console.error('Gemini API 호출 실패:', apiError)
            return {
                success: false,
                error: `AI 태그 생성에 실패했습니다: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`
            }
        }

        // 태그 파싱 및 저장
        console.log('태그 저장 시작:', { noteId, tagsText: result.text })

        // 기존 태그 삭제
        const { error: deleteError } = await supabase
            .from('tags')
            .delete()
            .eq('note_id', noteId)

        if (deleteError) {
            console.error('기존 태그 삭제 실패:', deleteError)
            return {
                success: false,
                error: `기존 태그 삭제 중 오류가 발생했습니다: ${deleteError.message}`
            }
        }

        // 태그 파싱 (쉼표로 구분)
        const tagNames = result.text
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .slice(0, 6) // 최대 6개

        if (tagNames.length === 0) {
            return {
                success: false,
                error: '생성된 태그가 없습니다.'
            }
        }

        // 태그 저장
        const tagsToInsert = tagNames.map(name => ({
            note_id: noteId,
            name: name
        }))

        const { error: insertError } = await supabase
            .from('tags')
            .insert(tagsToInsert)

        if (insertError) {
            console.error('태그 저장 실패:', insertError)
            return {
                success: false,
                error: `태그 저장 중 오류가 발생했습니다: ${insertError.message}`
            }
        }

        console.log('태그 저장 성공:', { tagCount: tagNames.length })

        // 페이지 캐시 무효화 (서버 컴포넌트에서만 실행)
        if (typeof window === 'undefined') {
            const { revalidatePath } = await import('next/cache')
            revalidatePath(`/notes/${noteId}`)
            revalidatePath('/notes')
        }

        return {
            success: true,
            tags: tagNames,
            usage: result.usage
        }
    } catch (error) {
        console.error('태그 생성 서버 액션 오류:', error)
        return {
            success: false,
            error: `태그 생성 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }
    }
}

// 태그 재생성 서버 액션
export async function regenerateTags(noteId: string) {
    return generateTags(noteId)
}

// 노트 태그 조회 서버 액션
export async function getNoteTags(noteId: string) {
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

        // 태그 조회
        const { data: tags, error: tagsError } = await supabase
            .from('tags')
            .select('*')
            .eq('note_id', noteId)
            .order('created_at', { ascending: true })

        if (tagsError) {
            console.error('태그 조회 실패:', tagsError)
            return {
                success: false,
                error: `태그 조회 중 오류가 발생했습니다: ${tagsError.message}`
            }
        }

        return {
            success: true,
            tags: tags || []
        }
    } catch (error) {
        console.error('태그 조회 서버 액션 오류:', error)
        return {
            success: false,
            error: `태그 조회 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }
    }
}

// 태그 업데이트 서버 액션
export async function updateTags(noteId: string, tagNames: string[]) {
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

        // 노트 소유권 확인
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('id')
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single()

        if (noteError || !note) {
            return {
                success: false,
                error: '노트를 찾을 수 없습니다.'
            }
        }

        // 기존 태그 삭제
        const { error: deleteError } = await supabase
            .from('tags')
            .delete()
            .eq('note_id', noteId)

        if (deleteError) {
            console.error('기존 태그 삭제 실패:', deleteError)
            return {
                success: false,
                error: `기존 태그 삭제 중 오류가 발생했습니다: ${deleteError.message}`
            }
        }

        // 새 태그 저장
        if (tagNames.length > 0) {
            const tagsToInsert = tagNames.map(name => ({
                note_id: noteId,
                name: name.trim()
            })).filter(tag => tag.name.length > 0)

            if (tagsToInsert.length > 0) {
                const { error: insertError } = await supabase
                    .from('tags')
                    .insert(tagsToInsert)

                if (insertError) {
                    console.error('태그 저장 실패:', insertError)
                    return {
                        success: false,
                        error: `태그 저장 중 오류가 발생했습니다: ${insertError.message}`
                    }
                }
            }
        }

        // 페이지 캐시 무효화 (서버 컴포넌트에서만 실행)
        if (typeof window === 'undefined') {
            const { revalidatePath } = await import('next/cache')
            revalidatePath(`/notes/${noteId}`)
            revalidatePath('/notes')
        }

        return {
            success: true,
            tags: tagNames
        }
    } catch (error) {
        console.error('태그 업데이트 서버 액션 오류:', error)
        return {
            success: false,
            error: `태그 업데이트 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        }
    }
}
