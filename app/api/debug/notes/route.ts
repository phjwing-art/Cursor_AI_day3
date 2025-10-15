// app/api/debug/notes/route.ts
// 디버깅용 노트 조회 API

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        
        // 사용자 인증 확인
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({
                success: false,
                error: 'User not authenticated',
                userError: userError?.message
            }, { status: 401 })
        }

        // 노트 조회
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (notesError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch notes',
                notesError: notesError.message,
                user: {
                    id: user.id,
                    email: user.email
                }
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email
            },
            notes: notes || [],
            count: notes?.length || 0
        })

    } catch (error) {
        console.error('Debug API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
