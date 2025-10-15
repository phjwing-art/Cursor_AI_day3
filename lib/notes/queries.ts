import { createClient } from '@/lib/supabase/server'

export interface Note {
    id: string
    user_id: string
    title: string
    content: string | null
    created_at: string
    updated_at: string
}

export async function getUserNotes() {
    const supabase = await createClient()

    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        return []
    }

    try {
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (notesError) {
            console.error('노트 조회 실패:', notesError)
            return []
        }

        return notes || []
    } catch (error) {
        console.error('노트 조회 실패:', error)
        return []
    }
}

export async function getNoteById(noteId: string) {
    const supabase = await createClient()

    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    try {
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
        console.error('노트 조회 실패:', error)
        return null
    }
}

export type NotesSort = 'newest' | 'oldest' | 'title'

function resolveOrderBy(sort: NotesSort) {
    switch (sort) {
        case 'oldest':
            return { column: 'updated_at', ascending: true }
        case 'title':
            return { column: 'title', ascending: true }
        case 'newest':
        default:
            return { column: 'updated_at', ascending: false }
    }
}

export async function getUserNotesPaginated({
    page,
    limit,
    sort
}: {
    page: number
    limit: number
    sort: NotesSort
}): Promise<{ notes: Note[]; totalCount: number }> {
    const supabase = await createClient()

    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        return { notes: [], totalCount: 0 }
    }

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
    const safeLimit =
        Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 12
    const offset = (safePage - 1) * safeLimit

    try {
        const orderBy = resolveOrderBy(sort)

        // 노트 조회
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order(orderBy.column, { ascending: orderBy.ascending })
            .range(offset, offset + safeLimit - 1)

        if (notesError) {
            console.error('노트 페이지네이션 조회 실패:', notesError)
            return { notes: [], totalCount: 0 }
        }

        // 총 개수 조회
        const { count, error: countError } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

        if (countError) {
            console.error('노트 개수 조회 실패:', countError)
            return { notes: notes || [], totalCount: 0 }
        }

        return { notes: notes || [], totalCount: count || 0 }
    } catch (error) {
        console.error('노트 페이지네이션 조회 실패:', error)
        return { notes: [], totalCount: 0 }
    }
}

export async function searchUserNotes({
    query,
    page,
    limit,
    sort
}: {
    query: string
    page: number
    limit: number
    sort: NotesSort
}): Promise<{ notes: Note[]; totalCount: number }> {
    const supabase = await createClient()

    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        return { notes: [], totalCount: 0 }
    }

    // 검색어가 없으면 기본 조회
    if (!query.trim()) {
        return getUserNotesPaginated({ page, limit, sort })
    }

    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
    const safeLimit =
        Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 12
    const offset = (safePage - 1) * safeLimit

    // const searchPattern = `%${query.trim()}%`

    try {
        const orderBy = resolveOrderBy(sort)

        // 검색 쿼리
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order(orderBy.column, { ascending: orderBy.ascending })
            .range(offset, offset + safeLimit - 1)

        if (notesError) {
            console.error('노트 검색 실패:', notesError)
            return { notes: [], totalCount: 0 }
        }

        // 검색 결과 총 개수
        const { count, error: countError } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)

        if (countError) {
            console.error('노트 검색 개수 실패:', countError)
            return { notes: notes || [], totalCount: 0 }
        }

        return { notes: notes || [], totalCount: count || 0 }
    } catch (error) {
        console.error('노트 검색 실패:', error)
        return { notes: [], totalCount: 0 }
    }
}
