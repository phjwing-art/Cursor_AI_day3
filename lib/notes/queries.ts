import { createClient } from '@/lib/supabase/server'

export interface Note {
    id: string
    title: string | null
    content: string | null
    user_id: string
    created_at: string
    updated_at: string
}

export interface PaginationParams {
    page: number
    limit: number
}

export interface PaginatedResult<T> {
    data: T[]
    totalCount: number
    page: number
    limit: number
    totalPages: number
}

export type NotesSort = 'newest' | 'oldest' | 'title'

export async function getUserNotesPaginated(params: PaginationParams) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
            console.log('사용자 인증 실패:', userError)
            return {
                notes: [],
                totalCount: 0
            }
        }
    
        const { page, limit } = params
        const offset = (page - 1) * limit
        
        // 총 개수 조회
        const { count: totalCount, error: countError } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
        
        if (countError) {
            console.error('노트 개수 조회 실패:', countError)
            return {
                notes: [],
                totalCount: 0
            }
        }
        
        // 노트 목록 조회
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1)
        
        if (notesError) {
            console.error('노트 조회 실패:', notesError)
            return {
                notes: [],
                totalCount: 0
            }
        }
        
        return {
            notes: notes || [],
            totalCount: totalCount || 0
        }
    } catch (error) {
        console.error('getUserNotesPaginated 함수 오류:', error)
        return {
            notes: [],
            totalCount: 0
        }
    }
}

export async function getNoteById(noteId: string) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
            console.log('사용자 인증 실패:', userError)
            return null
        }
        
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('*')
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single()
        
        if (noteError) {
            console.error('노트 조회 실패:', noteError)
            return null
        }
        
        return note
    } catch (error) {
        console.error('getNoteById 함수 오류:', error)
        return null
    }
}

export async function searchUserNotes(
    query: string,
    sort: NotesSort = 'newest',
    page: number = 1,
    limit: number = 10
) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
            console.log('사용자 인증 실패:', userError)
            return {
                notes: [],
                totalCount: 0
            }
        }

        const offset = (page - 1) * limit

        // 검색 쿼리 구성
        let searchQuery = supabase
            .from('notes')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)

        // 정렬 적용
        switch (sort) {
            case 'newest':
                searchQuery = searchQuery.order('updated_at', { ascending: false })
                break
            case 'oldest':
                searchQuery = searchQuery.order('updated_at', { ascending: true })
                break
            case 'title':
                searchQuery = searchQuery.order('title', { ascending: true })
                break
        }

        // 페이지네이션 적용
        searchQuery = searchQuery.range(offset, offset + limit - 1)

        const { data: notes, error: notesError, count: totalCount } = await searchQuery

        if (notesError) {
            console.error('노트 검색 실패:', notesError)
            return {
                notes: [],
                totalCount: 0
            }
        }

        return {
            notes: notes || [],
            totalCount: totalCount || 0
        }
    } catch (error) {
        console.error('searchUserNotes 함수 오류:', error)
        return {
            notes: [],
            totalCount: 0
        }
    }
}