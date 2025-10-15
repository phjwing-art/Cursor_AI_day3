// app/api/debug/notes-paginated/route.ts
// 페이지네이션된 노트 조회 디버깅 API

import { NextRequest, NextResponse } from 'next/server'
import { getUserNotesPaginated } from '@/lib/notes/queries'

export async function GET(request: NextRequest) {
    try {
        console.log('Debug: 페이지네이션 테스트 시작')
        
        const searchParams = request.nextUrl.searchParams
        const page = Number(searchParams.get('page')) || 1
        const limit = Number(searchParams.get('limit')) || 10

        console.log('Debug: Params:', { page, limit })

        const result = await getUserNotesPaginated({
            page,
            limit
        })

        console.log('Debug: Result:', result)

        return NextResponse.json({
            success: true,
            ...result
        })

    } catch (error) {
        console.error('Debug: 페이지네이션 테스트 오류:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 })
    }
}
