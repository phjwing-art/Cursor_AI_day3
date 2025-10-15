'use client'

import { useState } from 'react'
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
    const [currentTags, setCurrentTags] = useState(initialTags.map(tag => tag.name))
    const [newTagInput, setNewTagInput] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAddTag = () => {
        if (newTagInput.trim() && !currentTags.includes(newTagInput.trim())) {
            setCurrentTags([...currentTags, newTagInput.trim()])
            setNewTagInput('')
            setError(null)
        } else if (currentTags.includes(newTagInput.trim())) {
            setError('이미 존재하는 태그입니다.')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setCurrentTags(currentTags.filter(tag => tag !== tagToRemove))
        setError(null)
    }

    const handleSaveTags = async () => {
        setIsSaving(true)
        setError(null)
        try {
            const result = await updateTags(noteId, currentTags)
            if (result.success) {
                onSuccess && onSuccess(currentTags)
            } else {
                setError(result.error || '태그 저장에 실패했습니다.')
                onError && onError(result.error || '태그 저장에 실패했습니다.')
            }
        } catch (err) {
            console.error('태그 저장 중 오류 발생:', err)
            setError('태그 저장 중 예상치 못한 오류가 발생했습니다.')
            onError && onError('태그 저장 중 예상치 못한 오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                            onClick={() => handleRemoveTag(tag)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </Badge>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    placeholder="새 태그 추가"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                        }
                    }}
                    className="flex-grow"
                />
                <Button onClick={handleAddTag} variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button onClick={handleSaveTags} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? '저장 중...' : '저장'}
                </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
