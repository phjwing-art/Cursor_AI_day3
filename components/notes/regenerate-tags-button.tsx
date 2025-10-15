// components/notes/regenerate-tags-button.tsx
// 태그 재생성 버튼 컴포넌트

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { regenerateTags } from '@/lib/notes/tag-actions'

interface RegenerateTagsButtonProps {
    noteId: string
    onSuccess?: (tags: string[]) => void
    onError?: (error: string) => void
    className?: string
}

export function RegenerateTagsButton({ 
    noteId, 
    onSuccess, 
    onError, 
    className = '' 
}: RegenerateTagsButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleRegenerate = async () => {
        setIsLoading(true)
        
        try {
            const result = await regenerateTags(noteId)
            
            if (result.success) {
                onSuccess?.(result.tags || [])
            } else {
                onError?.(result.error || '태그 재생성에 실패했습니다.')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isLoading}
            className={className}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '재생성 중...' : '태그 재생성'}
        </Button>
    )
}
