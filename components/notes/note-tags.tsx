'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { getNoteTags } from '@/lib/notes/tag-actions'

interface NoteTagsProps {
    noteId: string
    className?: string
    maxTags?: number
}

export function NoteTags({ noteId, className = '', maxTags = 3 }: NoteTagsProps) {
    const [tags, setTags] = useState<Array<{ id: string; name: string; created_at: string }>>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadTags = async () => {
            try {
                setIsLoading(true)
                const result = await getNoteTags(noteId)
                if (result.success && result.tags) {
                    setTags(result.tags)
                }
            } catch (error) {
                console.error('태그 로드 실패:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadTags()
    }, [noteId])

    if (isLoading) {
        return (
            <div className={`flex gap-1 ${className}`}>
                <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
        )
    }

    if (tags.length === 0) {
        return null
    }

    const displayTags = tags.slice(0, maxTags)
    const remainingCount = tags.length - maxTags

    return (
        <div className={`flex flex-wrap gap-1 ${className}`}>
            {displayTags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                </Badge>
            ))}
            {remainingCount > 0 && (
                <Badge variant="outline" className="text-xs">
                    +{remainingCount}
                </Badge>
            )}
        </div>
    )
}
