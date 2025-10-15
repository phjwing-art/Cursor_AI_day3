// lib/notes/supabase-actions.ts
// Supabase 클라이언트를 사용한 노트 액션 (Drizzle 대신)

'use server'

// revalidatePath는 조건부로 import
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// 노트 생성 스키마
const createNoteSchema = z.object({
    title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내로 입력해주세요'),
    content: z.string().max(50000, '내용은 50,000자 이내로 입력해주세요').optional()
})

export async function createNote(formData: FormData) {
    const supabase = await createClient()

    // 사용자 인증 확인
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/signin')
    }

    // 폼 데이터 추출
    const title = formData.get('title') as string
    const content = formData.get('content') as string

    // 데이터 검증
    const validatedData = createNoteSchema.parse({
        title: title.trim() || '제목 없음',
        content: content.trim() || null
    })

    try {
        // Supabase 클라이언트로 노트 생성
        const { error } = await supabase
            .from('notes')
            .insert({
                user_id: user.id,
                title: validatedData.title,
                content: validatedData.content
            })
            .select()
            .single()

        if (error) {
            console.error('노트 생성 실패:', error)
            throw new Error('노트 저장에 실패했습니다. 다시 시도해주세요.')
        }

        // 캐시 무효화 (서버 컴포넌트에서만 실행)
        if (typeof window === 'undefined') {
            const { revalidatePath } = await import('next/cache')
            revalidatePath('/notes')
        }
    } catch (error) {
        console.error('노트 생성 실패:', error)
        throw new Error('노트 저장에 실패했습니다. 다시 시도해주세요.')
    }

    // 성공 시 노트 목록 페이지로 리다이렉트
    redirect('/notes')
}

// 노트 업데이트 스키마
const updateNoteSchema = z.object({
    title: z.string().max(200, '제목은 200자 이내로 입력해주세요').optional(),
    content: z.string().max(50000, '내용은 50,000자 이내로 입력해주세요').optional()
})

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>

export async function updateNote(
    noteId: string,
    data: UpdateNoteInput
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // 사용자 인증 확인
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: '인증이 필요합니다' }
    }

    try {
        // 데이터 검증
        const validatedData = updateNoteSchema.parse(data)

        // 업데이트할 데이터 준비
        const updateData: {
            updated_at: string
            title?: string
            content?: string | null
        } = {
            updated_at: new Date().toISOString()
        }

        if (validatedData.title !== undefined) {
            updateData.title = validatedData.title.trim() || '제목 없음'
        }

        if (validatedData.content !== undefined) {
            updateData.content = validatedData.content.trim() || null
        }

        // 노트 업데이트
        const { error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', noteId)
            .eq('user_id', user.id)

        if (error) {
            console.error('노트 업데이트 실패:', error)
            return { success: false, error: '노트 저장에 실패했습니다' }
        }

        // 캐시 무효화 (서버 컴포넌트에서만 실행)
        if (typeof window === 'undefined') {
            const { revalidatePath } = await import('next/cache')
            revalidatePath('/notes')
            revalidatePath(`/notes/${noteId}`)
        }

        return { success: true }
    } catch (error) {
        console.error('노트 업데이트 실패:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: '입력 데이터가 올바르지 않습니다' }
        }

        return { success: false, error: '노트 저장에 실패했습니다' }
    }
}

export async function deleteNote(noteId: string): Promise<{
    success: boolean
    error?: string
}> {
    const supabase = await createClient()

    // 사용자 인증 확인
    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: '인증이 필요합니다' }
    }

    try {
        // 노트 삭제
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', user.id)

        if (error) {
            console.error('노트 삭제 실패:', error)
            return { success: false, error: '노트 삭제에 실패했습니다' }
        }

        // 캐시 무효화 (서버 컴포넌트에서만 실행)
        if (typeof window === 'undefined') {
            const { revalidatePath } = await import('next/cache')
            revalidatePath('/notes')
            revalidatePath(`/notes/${noteId}`)
        }

        return { success: true }
    } catch (error) {
        console.error('노트 삭제 실패:', error)
        return { success: false, error: '노트 삭제에 실패했습니다' }
    }
}