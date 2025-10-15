// components/notes/tag-editor.tsx
// 태그 편집 컴포넌트

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Save } from 'lucide-react'
import { updateTags } from '@/lib/notes/tag-actions'

interface TagEditorProps {
    noteId: string
    initialTags: Array<{
        id: string
        name: string
        created_at?: string
        createdAt?: Date
    }>
    onSuccess?: (tags: string[]) => void
    onError?: (error: string) => void
    className?: string
}

export function TagEditor({ 
    noteId, 
    initialTags, 
    onSuccess, 
    onError, 
    className = '' 
}: TagEditorProps) {
    const [tags, setTags] = useState<string[]>([])
    const [newTag, setNewTag] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setTags(initialTags.map(tag => tag.name))
    }, [initialTags])

    const handleAddTag = () => {
        const trimmedTag = newTag.trim()
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
            setTags([...tags, trimmedTag])
            setNewTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        
        try {
            const result = await updateTags(noteId, tags)
            
            if (result.success) {
                onSuccess?.(result.tags || [])
            } else {
                onError?.(result.error || '태그 저장에 실패했습니다.')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">태그 편집</label>
                
                {/* 기존 태그 표시 */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:text-red-500"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>

                {/* 새 태그 추가 */}
                <div className="flex gap-2">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="새 태그 입력..."
                        maxLength={50}
                        disabled={tags.length >= 10}
                    />
                    <Button
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 10}
                        size="sm"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {tags.length >= 10 && (
                    <p className="text-sm text-gray-500">최대 10개까지 태그를 추가할 수 있습니다.</p>
                )}
            </div>

            {/* 저장 버튼 */}
            <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full"
            >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '저장 중...' : '태그 저장'}
            </Button>
        </div>
    )
}
