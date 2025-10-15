'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
        console.error('로그아웃 오류:', error)
        throw new Error('로그아웃에 실패했습니다.')
    }
    
    redirect('/signin')
}