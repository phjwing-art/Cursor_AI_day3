'use server'

import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai'
import { estimateTokens, validateTokenLimit } from '@/lib/ai/utils'
import { revalidatePath } from 'next/cache'

const SUMMARY_PROMPT = `
다음 노트 내용을 분석하여 핵심 내용을 요약해주세요.
요약은 3-5문장으로 작성하고, 노트의 주요 포인트와 결론을 포함해주세요.

노트 내용:
{noteContent}

요약:
`

export async function generateSummary(noteId: string) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            return { success: false, error: '인증이 필요합니다.' }
        }

        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('id, content')
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single()

        if (noteError || !note) {
            return { success: false, error: '노트를 찾을 수 없습니다.' }
        }

        if (!note.content || note.content.length < 100) {
            return { success: false, error: '노트 내용이 100자 이상이어야 요약을 생성할 수 있습니다.' }
        }

        const inputTokens = estimateTokens(note.content)
        if (!validateTokenLimit(inputTokens)) {
            return { success: false, error: '노트가 너무 길어서 요약을 생성할 수 없습니다.' }
        }

        let result: { text: string; usage?: unknown; finishReason?: unknown }
        try {
            console.log('요약 생성 시작:', { noteId, contentLength: note.content.length })

            const geminiClient = new GeminiClient()
            const summaryPrompt = SUMMARY_PROMPT.replace('{noteContent}', note.content)

            result = await geminiClient.generateText({
                prompt: summaryPrompt,
                maxTokens: 500,
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

        // 요약 저장
        console.log('요약 저장 시작:', { noteId, summaryText: result.text })

        // 기존 요약 삭제
        const { error: deleteError } = await supabase
            .from('summaries')
            .delete()
            .eq('note_id', noteId)

        if (deleteError) {
            console.log('기존 요약 삭제 중 오류 (테이블이 존재하지 않을 수 있음):', deleteError)
            if (deleteError.code === 'PGRST116' || deleteError.message?.includes('relation "summaries" does not exist')) {
                console.log('summaries 테이블이 존재하지 않습니다. 새로 생성합니다.')
            } else {
                console.error('기존 요약 삭제 실패:', deleteError)
                return {
                    success: false,
                    error: `기존 요약 삭제 중 오류가 발생했습니다: ${deleteError.message}`
                }
            }
        }

        // 요약 저장
        const { error: insertError } = await supabase
            .from('summaries')
            .insert({
                note_id: noteId,
                content: result.text
            })

        if (insertError) {
            console.error('요약 저장 실패:', insertError)
            
            if (insertError.code === 'PGRST116' || insertError.message?.includes('relation "summaries" does not exist')) {
                console.log('summaries 테이블이 존재하지 않습니다. 테이블을 먼저 생성해주세요.')
                return {
                    success: false,
                    error: 'summaries 테이블이 존재하지 않습니다. 데이터베이스에 summaries 테이블을 생성해주세요.'
                }
            }
            
            return {
                success: false,
                error: `요약 저장 중 오류가 발생했습니다: ${insertError.message}`
            }
        }

        console.log('요약 저장 성공')

        // 페이지 캐시 무효화
        if (typeof window === 'undefined') {
            revalidatePath(`/notes/${noteId}`)
            revalidatePath('/notes')
        }

        return { success: true, summary: result.text, usage: result.usage }
    } catch (error) {
        console.error('요약 생성 서버 액션 오류:', error)
        return { success: false, error: `요약 생성 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }
    }
}

export async function regenerateSummary(noteId: string) {
    // 기존 요약 삭제 후 generateSummary 호출
    const supabase = await createClient()
    await supabase.from('summaries').delete().eq('note_id', noteId)
    return generateSummary(noteId)
}

export async function getNoteSummary(noteId: string) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, error: '인증이 필요합니다.' }
    }

    // 요약 조회
    const { data: summary, error: summaryError } = await supabase
        .from('summaries')
        .select('*')
        .eq('note_id', noteId)
        .single()

    if (summaryError) {
        console.error('요약 조회 실패:', {
            error: summaryError,
            noteId,
            message: summaryError.message,
            details: summaryError.details,
            hint: summaryError.hint,
            code: summaryError.code
        })
        
        // 테이블이 존재하지 않는 경우
        if (summaryError.code === 'PGRST116' || summaryError.message?.includes('relation "summaries" does not exist')) {
            console.log('summaries 테이블이 존재하지 않습니다. 빈 값을 반환합니다.')
            return {
                success: true,
                summary: null
            }
        }
        
        return {
            success: false,
            error: `요약 조회 중 오류가 발생했습니다: ${summaryError.message || '알 수 없는 오류'}`
        }
    }

    return {
        success: true,
        summary: summary
    }
}