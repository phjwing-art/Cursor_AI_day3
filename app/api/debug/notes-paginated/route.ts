// app/api/debug/notes-paginated/route.ts
// 페이지네이션된 노트 조회 디버깅 API

import { NextResponse } from 'next/server'
import { getUserNotesPaginated } from '@/lib/notes/queries'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = parseInt(searchParams.get('limit') || '12', 10)
        const sort = (searchParams.get('sort') || 'newest') as 'newest' | 'oldest' | 'title'

        console.log('Debug: Fetching notes with params:', { page, limit, sort })

        const result = await getUserNotesPaginated({
            page,
            limit,
            sort
        })

        console.log('Debug: Result:', result)

        return NextResponse.json({
            success: true,
            params: { page, limit, sort },
            result: result
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
