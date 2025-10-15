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
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tags.map((tag) => (
                <Badge
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                    onClick={() => onTagClick && onTagClick(tag.name)}
                >
                    <Tag className="h-3 w-3" />
                    {tag.name}
                </Badge>
            ))}
        </div>
    )
}
