'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Calendar, Clock, Type } from 'lucide-react'
import { NotesSort } from '@/lib/notes/queries'

interface NotesSortProps {
    currentSort: NotesSort
    className?: string
}

export function NotesSort({ currentSort, className = '' }: NotesSortProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const sortOptions = [
        {
            value: 'newest' as NotesSort,
            label: '최신순',
            icon: Calendar
        },
        {
            value: 'oldest' as NotesSort,
            label: '오래된순',
            icon: Clock
        },
        {
            value: 'title' as NotesSort,
            label: '제목순',
            icon: Type
        }
    ]

    const handleSortChange = (sort: NotesSort) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', sort)
        params.delete('page') // 정렬 변경 시 첫 페이지로
        router.push(`/notes?${params.toString()}`)
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">정렬:</span>
            <div className="flex gap-1">
                {sortOptions.map((option) => {
                    const Icon = option.icon
                    const isActive = currentSort === option.value
                    
                    return (
                        <Button
                            key={option.value}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSortChange(option.value)}
                            className={`gap-1 ${
                                isActive 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Icon className="h-3 w-3" />
                            {option.label}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}