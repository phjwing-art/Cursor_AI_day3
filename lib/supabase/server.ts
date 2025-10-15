import { createServerClient } from '@supabase/ssr'

export async function createClient() {
    // 서버 컴포넌트에서만 cookies 사용
    if (typeof window === 'undefined') {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()

        return createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    }
                }
            }
        )
    }

    // 클라이언트에서는 기본 클라이언트 사용
    const { createBrowserClient } = await import('@supabase/ssr')
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
