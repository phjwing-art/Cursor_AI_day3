import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { LogoutDialog } from '@/components/auth/logout-dialog'
import { PenTool, Search, Tag, Download } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
    // 로그인 확인 - getUser()를 사용하여 서버에서 인증 확인
    const supabase = await createClient()
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    // 로그인하지 않은 사용자를 위한 랜딩 페이지
    if (error || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                    {/* 헤더 */}
                    <div className="text-center mb-8 sm:mb-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">AI 메모장</h1>
                        <p className="text-gray-600 mt-2 text-sm sm:text-base">지능형 메모 관리 시스템</p>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                            AI와 함께하는<br />
                            <span className="text-blue-600">스마트 메모</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                            인공지능이 자동으로 요약하고 태그를 생성해주는 혁신적인 메모 관리 시스템입니다.
                        </p>
                    </div>

                    {/* 기능 소개 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-16">
                        <Card className="text-center p-4 sm:p-8">
                            <PenTool className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">빠른 메모 작성</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                아이디어를 즉시 기록하고 정리하세요. 언제 어디서나 접근 가능합니다.
                            </p>
                        </Card>

                        <Card className="text-center p-4 sm:p-8">
                            <Search className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">AI 스마트 검색</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                AI가 이해하는 지능형 검색으로 원하는 내용을 빠르게 찾으세요.
                            </p>
                        </Card>

                        <Card className="text-center p-4 sm:p-8">
                            <Tag className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">자동 태깅</h3>
                            <p className="text-sm sm:text-base text-gray-600">
                                AI가 자동으로 관련 태그를 생성하여 노트를 체계적으로 관리하세요.
                            </p>
                        </Card>
                    </div>


                    {/* 액션 섹션 */}
                    <Card className="max-w-lg mx-auto">
                        <CardHeader className="text-center p-4 sm:p-6">
                            <CardTitle className="text-xl sm:text-2xl">지금 시작해보세요!</CardTitle>
                            <CardDescription className="text-base sm:text-lg">
                                AI 메모장으로 스마트한 메모 관리를 경험해보세요.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Link href="/signup" className="flex-1">
                                    <Button className="w-full" size="lg">
                                        무료로 시작하기
                                    </Button>
                                </Link>
                                <Link href="/signin" className="flex-1">
                                    <Button variant="outline" className="w-full" size="lg">
                                        로그인
                                    </Button>
                                </Link>
                            </div>
                            <div className="text-center">
                                <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                                    비밀번호를 잊으셨나요?
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // 로그인된 사용자를 위한 대시보드
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* 헤더 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI 메모장</h1>
                        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">지능형 메모 관리 시스템</p>
                    </div>
                    <div className="flex justify-end">
                        <LogoutDialog />
                    </div>
                </div>

                {/* 환영 메시지 */}
                <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-blue-900 text-lg sm:text-xl">
                            대시보드에 오신 것을 환영합니다!
                        </CardTitle>
                        <CardDescription className="text-blue-700 text-sm sm:text-base">
                            AI의 도움을 받아 똑똑하게 메모를 관리해보세요.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* 기능 카드들 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                    
                    <Card>
                        <CardContent className="text-center py-12">
                            <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">노트를 확인하려면</h3>
                            <p className="text-gray-600 mb-4">모든 노트 페이지에서 확인하실 수 있습니다.</p>
                            <Link href="/notes">
                                <Button>
                                    <PenTool className="h-4 w-4 mr-2" />
                                    노트 보기
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}