// app/debug/page.tsx
// 디버깅용 페이지

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DebugData {
    success: boolean
    user?: {
        id: string
        email: string
    }
    notes?: unknown[]
    count?: number
    error?: string
    userError?: string
    notesError?: string
}

export default function DebugPage() {
    const [debugData, setDebugData] = useState<DebugData | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchDebugData = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/notes')
            const data = await response.json()
            setDebugData(data)
        } catch (error) {
            setDebugData({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const createTestNote = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/create-test-note', {
                method: 'POST'
            })
            const data = await response.json()
            setDebugData(data)
        } catch (error) {
            setDebugData({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchPaginatedNotes = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/notes-paginated?page=1&limit=12&sort=newest')
            const data = await response.json()
            setDebugData(data)
        } catch (error) {
            setDebugData({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const createMockNotes = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/create-mock-notes', {
                method: 'POST'
            })
            const data = await response.json()
            setDebugData(data)
        } catch (error) {
            setDebugData({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    const testGeminiAPI = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/debug/test-gemini')
            const data = await response.json()
            setDebugData(data)
        } catch (error) {
            setDebugData({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDebugData()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">디버깅 페이지</h1>
                
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>노트 데이터 확인</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-x-2">
                                <Button onClick={fetchDebugData} disabled={loading}>
                                    {loading ? '로딩 중...' : '데이터 새로고침'}
                                </Button>
                                <Button onClick={createTestNote} disabled={loading} variant="outline">
                                    {loading ? '생성 중...' : '테스트 노트 생성'}
                                </Button>
                                <Button onClick={fetchPaginatedNotes} disabled={loading} variant="secondary">
                                    {loading ? '로딩 중...' : '페이지네이션 테스트'}
                                </Button>
                                <Button onClick={createMockNotes} disabled={loading} variant="destructive">
                                    {loading ? '생성 중...' : '목업 데이터 10개 생성'}
                                </Button>
                                <Button onClick={testGeminiAPI} disabled={loading} variant="outline">
                                    {loading ? '테스트 중...' : 'Gemini API 테스트'}
                                </Button>
                            </div>
                            
                            {debugData && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">결과:</h3>
                                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                                        {JSON.stringify(debugData, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>환경변수 확인</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '설정 안됨'}
                                </div>
                                <div>
                                    <strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '설정 안됨'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
