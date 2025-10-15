import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNoteById } from '@/lib/notes/queries'
import { NoteEditor } from '@/components/notes/note-editor'

export default async function NoteDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    // 로그인 확인
    const supabase = await createClient()
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/signin')
    }

    // 노트 조회
    const note = await getNoteById(id)

    if (!note) {
        notFound()
    }

    return <NoteEditor note={note} />
}