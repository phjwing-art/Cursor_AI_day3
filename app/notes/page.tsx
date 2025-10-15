import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
    getUserNotesPaginated,
    searchUserNotes,
    type NotesSort
} from '@/lib/notes/queries'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { NotesList } from '@/components/notes/notes-list'
import { SearchInput } from '@/components/notes/search-input'
import { NotesSort as NotesSortComponent } from '@/components/notes/notes-sort'

interface NotesPageProps {
    searchParams: {
        search?: string
        sort?: NotesSort
        page?: string
    }
}

export default async function NotesPage({ searchParams }: NotesPageProps) {
    // 로그인 확인
    const supabase = await createClient()
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/signin')
    }

    const search = searchParams.search || ''
    const sort = (searchParams.sort as NotesSort) || 'newest'
    const page = parseInt(searchParams.page || '1', 10)

    // 노트 데이터 가져오기
    let notes = []
    let totalCount = 0

    try {
        if (search.trim()) {
            // 검색 결과
            const result = await searchUserNotes(search, sort, page, 10)
            notes = result.notes || []
            totalCount = result.totalCount || 0
        } else {
            // 전체 노트 목록
            const result = await getUserNotesPaginated({ page, limit: 10 })
            notes = result.notes || []
            totalCount = result.totalCount || 0
        }
    } catch (error) {
        console.error('노트 데이터 로드 실패:', error)
        notes = []
        totalCount = 0
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">내 노트</h1>
                        <p className="text-gray-600 mt-2">
                            {search ? `"${search}" 검색 결과` : '모든 노트를 관리하세요'}
                        </p>
                    </div>
                    <Link href="/notes/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            새 노트 작성
                        </Button>
                    </Link>
                </div>

                {/* 검색 및 정렬 */}
                <div className="mb-8 space-y-4">
                    <SearchInput defaultValue={search} />
                    <NotesSortComponent currentSort={sort} />
                </div>

                {/* 노트 목록 */}
                {Array.isArray(notes) && notes.length > 0 ? (
                    <NotesList 
                        notes={notes} 
                        totalCount={totalCount}
                        showPagination={true}
                    />
                ) : (
                    <div className="text-center py-12">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <Plus className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {search ? '검색 결과가 없습니다' : '아직 노트가 없습니다'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {search 
                                    ? '다른 키워드로 검색해보세요' 
                                    : '첫 번째 노트를 작성해보세요!'
                                }
                            </p>
                            {!search && (
                                <Link href="/notes/new">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        새 노트 작성
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}