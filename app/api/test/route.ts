import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        console.log('API 테스트 시작')

        // Supabase 연결 테스트
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
            return NextResponse.json({
                success: false,
                error: 'Supabase 인증 실패',
                details: userError
            }, { status: 500 })
        }

        // 환경 변수 확인
        const envCheck = {
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음',
            SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '없음',
            GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '설정됨' : '없음',
            NODE_ENV: process.env.NODE_ENV
        }

        // 노트 테이블 존재 확인
        let notesTableExists = false
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('id')
                .limit(1)

            if (!error) {
                notesTableExists = true
            }
        } catch (error) {
            console.log('notes 테이블 확인 실패:', error)
        }

        // 태그 테이블 존재 확인
        let tagsTableExists = false
        try {
            const { data, error } = await supabase
                .from('tags')
                .select('id')
                .limit(1)

            if (!error) {
                tagsTableExists = true
            }
        } catch (error) {
            console.log('tags 테이블 확인 실패:', error)
        }

        // 요약 테이블 존재 확인
        let summariesTableExists = false
        try {
            const { data, error } = await supabase
                .from('summaries')
                .select('id')
                .limit(1)

            if (!error) {
                summariesTableExists = true
            }
        } catch (error) {
            console.log('summaries 테이블 확인 실패:', error)
        }

        return NextResponse.json({
            success: true,
            message: 'API 테스트 성공',
            user: user ? {
                id: user.id,
                email: user.email
            } : null,
            environment: envCheck,
            database: {
                notesTable: notesTableExists,
                tagsTable: tagsTableExists,
                summariesTable: summariesTableExists
            },
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('API 테스트 실패:', error)
        return NextResponse.json({
            success: false,
            error: 'API 테스트 실패',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 })
    }
}
