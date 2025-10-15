import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LogoutDialog } from '@/components/auth/logout-dialog'
import { PenTool, Search, Tag, Download } from 'lucide-react'
import Link from 'next/link'
import { NotesList } from '@/components/notes/notes-list'
import { getUserNotesPaginated } from '@/lib/notes/queries'

export default async function HomePage() {
    // 로그인 확인 - getUser()를 사용하여 서버에서 인증 확인
    const supabase = await createClient()
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/signin')
    }

    // 노트 데이터 가져오기
    const { notes, totalCount } = await getUserNotesPaginated({
        page: 1,
        limit: 10
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI 메모장</h1>
                        <p className="text-gray-600 mt-2">지능형 메모 관리 시스템</p>
                    </div>
                    <LogoutDialog />
                </div>

                {/* 환영 메시지 */}
                <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-blue-900">
                            대시보드에 오신 것을 환영합니다!
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            AI의 도움을 받아 똑똑하게 메모를 관리해보세요.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* 기능 카드들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <PenTool className="h-8 w-8 text-blue-600" />
                                <span className="text-sm text-blue-600 font-medium">새 노트</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-gray-900 mb-2">빠른 메모 작성</h3>
                            <p className="text-sm text-gray-600">
                                아이디어를 즉시 기록하고 정리하세요
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Search className="h-8 w-8 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">검색</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-gray-900 mb-2">스마트 검색</h3>
                            <p className="text-sm text-gray-600">
                                AI가 이해하는 지능형 검색으로 원하는 내용을 빠르게 찾으세요
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Tag className="h-8 w-8 text-purple-600" />
                                <span className="text-sm text-purple-600 font-medium">태그</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-gray-900 mb-2">자동 태깅</h3>
                            <p className="text-sm text-gray-600">
                                AI가 자동으로 관련 태그를 생성하여 노트를 체계적으로 관리하세요
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Download className="h-8 w-8 text-orange-600" />
                                <span className="text-sm text-orange-600 font-medium">내보내기</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-gray-900 mb-2">데이터 백업</h3>
                            <p className="text-sm text-gray-600">
                                언제든지 노트를 내보내고 백업하여 안전하게 보관하세요
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 최근 노트 섹션 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">최근 노트</h2>
                        <Link href="/notes">
                            <Button variant="outline" size="sm">
                                모든 노트 보기
                            </Button>
                        </Link>
                    </div>
                    
                    {notes && notes.length > 0 ? (
                        <NotesList 
                            notes={notes} 
                            totalCount={totalCount}
                            showPagination={false}
                        />
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">아직 노트가 없습니다</h3>
                                <p className="text-gray-600 mb-4">첫 번째 노트를 작성해보세요!</p>
                                <Link href="/notes/new">
                                    <Button>
                                        <PenTool className="h-4 w-4 mr-2" />
                                        새 노트 작성
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}