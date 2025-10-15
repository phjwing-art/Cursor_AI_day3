// components/notes/tag-display.tsx
// 태그 표시 컴포넌트

'use client'

import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

interface TagDisplayProps {
    tags: Array<{
        id: string
        name: string
        created_at?: string
        createdAt?: Date
    }>
    onTagClick?: (tagName: string) => void
    className?: string
}

export function TagDisplay({ tags, onTagClick, className = '' }: TagDisplayProps) {
    if (!tags || tags.length === 0) {
        return null
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4" />
                <span>태그</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => onTagClick?.(tag.name)}
                    >
                        {tag.name}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
