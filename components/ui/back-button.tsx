'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface BackButtonProps {
    href?: string
    className?: string
    children?: React.ReactNode
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'default' | 'lg'
}

export function BackButton({ 
    href, 
    className, 
    children = '뒤로가기',
    variant = 'outline',
    size = 'default'
}: BackButtonProps) {
    const router = useRouter()

    const handleBack = () => {
        if (href) {
            router.push(href)
        } else {
            router.back()
        }
    }

    return (
        <Button 
            variant={variant}
            size={size}
            onClick={handleBack}
            className={cn('gap-2', className)}
        >
            <ArrowLeft className="h-4 w-4" />
            {children}
        </Button>
    )
}