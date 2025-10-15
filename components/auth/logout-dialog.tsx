'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth/actions'

export function LogoutDialog() {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await signOut()
        } catch (error) {
            console.error('로그아웃 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900"
        >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? '로그아웃 중...' : '로그아웃'}
        </Button>
    )
}