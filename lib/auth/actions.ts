'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/verify-email')
}

export async function resetPasswordForEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/signin')
}