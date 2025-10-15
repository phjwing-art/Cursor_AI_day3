import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NoteEditor } from '@/components/notes/note-editor'

export default async function NewNotePage() {
    // 로그인 확인
    const supabase = await createClient()
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/signin')
    }

    // 새 노트 생성
    const { data: newNote, error: createError } = await supabase
        .from('notes')
        .insert({
            title: '',
            content: '',
            user_id: user.id
        })
        .select()
        .single()

    if (createError || !newNote) {
        console.error('새 노트 생성 실패:', createError)
        redirect('/notes')
    }

    return <NoteEditor note={newNote} />
}