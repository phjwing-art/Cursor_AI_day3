// app/api-test/page.tsx
// Gemini API 테스트 페이지

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface TestResult {
    success: boolean
    message: string
    data?: unknown
    latency?: number
}

export default function APITestPage() {
    const [testPrompt, setTestPrompt] = useState('Hello, how are you?')
    const [isLoading, setIsLoading] = useState(false)
    const [results, setResults] = useState<TestResult[]>([])
    const [streamingText, setStreamingText] = useState('')

    const runHealthCheck = async () => {
        setIsLoading(true)
        const startTime = Date.now()
        
        try {
            const response = await fetch('/api/ai/health')
            const data = await response.json()
            const latency = Date.now() - startTime
            
            setResults(prev => [...prev, {
                success: response.ok,
                message: response.ok ? 'Health check passed' : 'Health check failed',
                data,
                latency
            }])
        } catch (error) {
            setResults(prev => [...prev, {
                success: false,
                message: `Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                latency: Date.now() - startTime
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const runTextGeneration = async () => {
        setIsLoading(true)
        const startTime = Date.now()
        
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: testPrompt }),
            })
            const data = await response.json()
            const latency = Date.now() - startTime
            
            setResults(prev => [...prev, {
                success: response.ok,
                message: response.ok ? 'Text generation successful' : 'Text generation failed',
                data,
                latency
            }])
        } catch (error) {
            setResults(prev => [...prev, {
                success: false,
                message: `Text generation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                latency: Date.now() - startTime
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const runStreamingTest = async () => {
        setIsLoading(true)
        setStreamingText('')
        const startTime = Date.now()
        
        try {
            const response = await fetch('/api/ai/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: testPrompt }),
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const reader = response.body?.getReader()
            if (!reader) {
                throw new Error('No response body')
            }

            const decoder = new TextDecoder()
            let fullText = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            if (data.text) {
                                fullText += data.text
                                setStreamingText(fullText)
                            }
                        } catch {
                            // Skip invalid JSON lines
                        }
                    }
                }
            }

            const latency = Date.now() - startTime
            setResults(prev => [...prev, {
                success: true,
                message: 'Streaming test completed',
                data: { text: fullText },
                latency
            }])
        } catch (error) {
            setResults(prev => [...prev, {
                success: false,
                message: `Streaming error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                latency: Date.now() - startTime
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const clearResults = () => {
        setResults([])
        setStreamingText('')
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Gemini API 테스트</CardTitle>
                    <p className="text-gray-600">
                        Gemini API의 동작을 검증하는 테스트 페이지입니다.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 테스트 입력 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                테스트 프롬프트
                            </label>
                            <Textarea
                                value={testPrompt}
                                onChange={(e) => setTestPrompt(e.target.value)}
                                placeholder="AI에게 보낼 메시지를 입력하세요..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    {/* 테스트 버튼들 */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={runHealthCheck}
                            disabled={isLoading}
                            variant="outline"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            헬스체크
                        </Button>
                        
                        <Button
                            onClick={runTextGeneration}
                            disabled={isLoading}
                            variant="outline"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <AlertCircle className="w-4 h-4 mr-2" />
                            )}
                            텍스트 생성
                        </Button>
                        
                        <Button
                            onClick={runStreamingTest}
                            disabled={isLoading}
                            variant="outline"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <AlertCircle className="w-4 h-4 mr-2" />
                            )}
                            스트리밍 테스트
                        </Button>
                        
                        <Button
                            onClick={clearResults}
                            disabled={isLoading}
                            variant="destructive"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            결과 지우기
                        </Button>
                    </div>

                    {/* 스트리밍 결과 */}
                    {streamingText && (
                        <div className="space-y-2">
                            <h3 className="font-medium">스트리밍 결과:</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <pre className="whitespace-pre-wrap text-sm">
                                    {streamingText}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* 테스트 결과 */}
                    {results.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-medium">테스트 결과:</h3>
                            <div className="space-y-2">
                                {results.map((result, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${
                                            result.success
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {result.success ? (
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                            <span className="font-medium">
                                                {result.message}
                                            </span>
                                            {result.latency && (
                                                <span className="text-sm text-gray-500">
                                                    ({result.latency}ms)
                                                </span>
                                            )}
                                        </div>
                                        {result.data ? (
                                            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                                {JSON.stringify(result.data as Record<string, unknown>, null, 2)}
                                            </pre>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

