'use server'

import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai'
import { estimateTokens, validateTokenLimit } from '@/lib/ai/utils'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const TAG_PROMPT = `
다음 노트 내용을 분석하여 관련성 높은 태그를 최대 6개까지 생성해주세요.
태그는 한국어로 작성하고, 노트의 핵심 주제와 키워드를 반영해주세요.

노트 내용:
{noteContent}

태그 (쉼표로 구분):
`

export async function generateTags(noteId: string) {
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
            return { success: false, error: '노트 내용이 100자 이상이어야 태그를 생성할 수 있습니다.' }
        }

        const inputTokens = estimateTokens(note.content)
        if (!validateTokenLimit(inputTokens)) {
            return { success: false, error: '노트가 너무 길어서 태그를 생성할 수 없습니다.' }
        }

        let result: { text: string; usage?: unknown; finishReason?: unknown }
        try {
            console.log('태그 생성 시작:', { noteId, contentLength: note.content.length })

            const geminiClient = new GeminiClient()
            const tagPrompt = TAG_PROMPT.replace('{noteContent}', note.content)

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
            console.log('기존 태그 삭제 중 오류 (테이블이 존재하지 않을 수 있음):', deleteError)
            if (deleteError.code === 'PGRST116' || deleteError.message?.includes('relation "tags" does not exist')) {
                console.log('tags 테이블이 존재하지 않습니다. 새로 생성합니다.')
            } else {
                console.error('기존 태그 삭제 실패:', deleteError)
                return {
                    success: false,
                    error: `기존 태그 삭제 중 오류가 발생했습니다: ${deleteError.message}`
                }
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
            
            if (insertError.code === 'PGRST116' || insertError.message?.includes('relation "tags" does not exist')) {
                console.log('tags 테이블이 존재하지 않습니다. 테이블을 먼저 생성해주세요.')
                return {
                    success: false,
                    error: 'tags 테이블이 존재하지 않습니다. 데이터베이스에 tags 테이블을 생성해주세요.'
                }
            }
            
            return {
                success: false,
                error: `태그 저장 중 오류가 발생했습니다: ${insertError.message}`
            }
        }

        console.log('태그 저장 성공:', { tagCount: tagNames.length })

        // 페이지 캐시 무효화
        if (typeof window === 'undefined') {
            revalidatePath(`/notes/${noteId}`)
            revalidatePath('/notes')
        }

        return { success: true, tags: tagNames, usage: result.usage }
    } catch (error) {
        console.error('태그 생성 서버 액션 오류:', error)
        return { success: false, error: `태그 생성 중 예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` }
    }
}

export async function regenerateTags(noteId: string) {
    const supabase = await createClient()
    await supabase.from('tags').delete().eq('note_id', noteId)
    return generateTags(noteId)
}

export async function getNoteTags(noteId: string) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, error: '인증이 필요합니다.' }
    }

    // 태그 조회
    const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('note_id', noteId)
        .order('created_at', { ascending: true })

    if (tagsError) {
        console.error('태그 조회 실패:', {
            error: tagsError,
            noteId,
            message: tagsError.message,
            details: tagsError.details,
            hint: tagsError.hint,
            code: tagsError.code
        })
        
        // 테이블이 존재하지 않는 경우
        if (tagsError.code === 'PGRST116' || tagsError.message?.includes('relation "tags" does not exist')) {
            console.log('tags 테이블이 존재하지 않습니다. 빈 배열을 반환합니다.')
            return {
                success: true,
                tags: []
            }
        }
        
        return {
            success: false,
            error: `태그 조회 중 오류가 발생했습니다: ${tagsError.message || '알 수 없는 오류'}`
        }
    }

    return {
        success: true,
        tags: tags || []
    }
}

export async function updateTags(noteId: string, newTagNames: string[]) {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, error: '인증이 필요합니다.' }
    }

    const validatedTags = z.array(z.string().min(1).max(50)).parse(newTagNames)

    // 기존 태그 삭제
    const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .eq('note_id', noteId)

    if (deleteError) {
        console.log('기존 태그 삭제 중 오류 (테이블이 존재하지 않을 수 있음):', deleteError)
        if (deleteError.code === 'PGRST116' || deleteError.message?.includes('relation "tags" does not exist')) {
            console.log('tags 테이블이 존재하지 않습니다. 새로 생성합니다.')
        } else {
            console.error('태그 삭제 실패:', deleteError)
            return {
                success: false,
                error: `태그 삭제 중 오류가 발생했습니다: ${deleteError.message}`
            }
        }
    }

    // 새 태그 삽입
    if (validatedTags.length > 0) {
        const tagsToInsert = validatedTags.map(tagName => ({
            note_id: noteId,
            name: tagName
        }))
        const { error: insertError } = await supabase.from('tags').insert(tagsToInsert)
        if (insertError) {
            console.error('태그 업데이트 실패:', insertError)
            
            if (insertError.code === 'PGRST116' || insertError.message?.includes('relation "tags" does not exist')) {
                console.log('tags 테이블이 존재하지 않습니다. 테이블을 먼저 생성해주세요.')
                return {
                    success: false,
                    error: 'tags 테이블이 존재하지 않습니다. 데이터베이스에 tags 테이블을 생성해주세요.'
                }
            }
            
            return {
                success: false,
                error: `태그 업데이트 중 오류가 발생했습니다: ${insertError.message}`
            }
        }
    }

    // 페이지 캐시 무효화
    if (typeof window === 'undefined') {
        revalidatePath(`/notes/${noteId}`)
        revalidatePath('/notes')
    }

    return { success: true }
}
