import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            )
        }

        const { id: noteId } = await params
        const { title, content } = await request.json()

        // 노트 소유권 확인
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('id, user_id')
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single()

        if (noteError || !note) {
            return NextResponse.json(
                { error: '노트를 찾을 수 없습니다.' },
                { status: 404 }
            )
        }

        // 노트 업데이트
        const { data: updatedNote, error: updateError } = await supabase
            .from('notes')
            .update({
                title: title || null,
                content: content || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', noteId)
            .select()
            .single()

        if (updateError) {
            console.error('노트 업데이트 실패:', updateError)
            return NextResponse.json(
                { error: '노트 업데이트에 실패했습니다.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, note: updatedNote })
    } catch (error) {
        console.error('노트 업데이트 API 오류:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            )
        }

        const { id: noteId } = await params

        // 노트 소유권 확인
        const { data: note, error: noteError } = await supabase
            .from('notes')
            .select('id, user_id')
            .eq('id', noteId)
            .eq('user_id', user.id)
            .single()

        if (noteError || !note) {
            return NextResponse.json(
                { error: '노트를 찾을 수 없습니다.' },
                { status: 404 }
            )
        }

        // 노트 삭제
        const { error: deleteError } = await supabase
            .from('notes')
            .delete()
            .eq('id', noteId)

        if (deleteError) {
            console.error('노트 삭제 실패:', deleteError)
            return NextResponse.json(
                { error: '노트 삭제에 실패했습니다.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('노트 삭제 API 오류:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
}
