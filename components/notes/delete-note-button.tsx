'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeleteNoteButtonProps {
    noteId: string
}

export function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('정말로 이 노트를 삭제하시겠습니까?')) {
            return
        }

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/notes/${noteId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('노트 삭제에 실패했습니다.')
            }

            router.push('/notes')
        } catch (error) {
            console.error('노트 삭제 실패:', error)
            alert('노트 삭제에 실패했습니다.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 border-red-300 hover:bg-red-50"
        >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? '삭제 중...' : '삭제'}
        </Button>
    )
}