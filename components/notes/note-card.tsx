'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import { Note } from '@/lib/notes/queries'

interface NoteCardProps {
    note: Note
    onDelete?: (noteId: string) => void
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!onDelete) return
        
        setIsDeleting(true)
        try {
            await onDelete(note.id)
        } catch (error) {
            console.error('노트 삭제 실패:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                            {note.title || '제목 없음'}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(note.updated_at)}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <Link href={`/notes/${note.id}`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                편집
                            </Button>
                        </Link>
                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <p className="text-gray-700 text-sm line-clamp-3">
                    {note.content || '내용이 없습니다.'}
                </p>
                {note.content && note.content.length > 200 && (
                    <div className="mt-3">
                        <Link href={`/notes/${note.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600">
                                전체 내용 보기
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}