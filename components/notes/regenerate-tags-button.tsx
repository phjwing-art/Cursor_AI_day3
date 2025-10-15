'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { regenerateTags } from '@/lib/notes/tag-actions'

interface RegenerateTagsButtonProps {
    noteId: string
    onSuccess?: (tags: string[]) => void
    onError?: (error: string) => void
}

export function RegenerateTagsButton({ noteId, onSuccess, onError }: RegenerateTagsButtonProps) {
    const [isRegenerating, setIsRegenerating] = useState(false)

    const handleRegenerate = async () => {
        setIsRegenerating(true)
        try {
            const result = await regenerateTags(noteId)
            if (result.success) {
                onSuccess?.(result.tags || [])
            } else {
                onError?.(result.error || '태그 재생성에 실패했습니다.')
            }
        } catch (error) {
            console.error('태그 재생성 실패:', error)
            onError?.('태그 재생성 중 오류가 발생했습니다.')
        } finally {
            setIsRegenerating(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? '재생성 중...' : '태그 재생성'}
        </Button>
    )
}