// components/notes/regenerate-summary-button.tsx
// 요약 재생성 버튼 컴포넌트

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2 } from 'lucide-react'
import { regenerateSummary } from '@/lib/notes/actions'

interface RegenerateSummaryButtonProps {
    noteId: string
    onSuccess?: (summary: string) => void
    onError?: (error: string) => void
}

export function RegenerateSummaryButton({ 
    noteId, 
    onSuccess, 
    onError 
}: RegenerateSummaryButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleRegenerate = async () => {
        setIsLoading(true)
        
        try {
            const result = await regenerateSummary(noteId)
            
            if (result.success) {
                onSuccess?.(result.summary || '')
            } else {
                onError?.(result.error || '요약 재생성에 실패했습니다.')
            }
        } catch {
            onError?.('요약 재생성 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleRegenerate}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <RefreshCw className="w-4 h-4" />
            )}
            {isLoading ? '재생성 중...' : '요약 재생성'}
        </Button>
    )
}
