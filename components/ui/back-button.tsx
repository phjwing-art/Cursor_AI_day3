'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    href: string
    className?: string
}

export function BackButton({ href, className }: BackButtonProps) {
    return (
        <Link href={href}>
            <Button variant="outline" className={cn('gap-2', className)}>
                <ArrowLeft className="h-4 w-4" />
                뒤로가기
            </Button>
        </Link>
    )
}