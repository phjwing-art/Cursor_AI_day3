// app/api/debug/create-test-note/route.ts
// 테스트 노트 생성 API

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
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

        // 테스트 노트 생성
        const testNote = {
            user_id: user.id,
            title: '테스트 노트',
            content: '이것은 디버깅을 위한 테스트 노트입니다.'
        }

        const { data: note, error: insertError } = await supabase
            .from('notes')
            .insert(testNote)
            .select()
            .single()

        if (insertError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to create test note',
                insertError: insertError.message,
                user: {
                    id: user.id,
                    email: user.email
                }
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Test note created successfully',
            note: note,
            user: {
                id: user.id,
                email: user.email
            }
        })

    } catch (error) {
        console.error('Create test note error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
