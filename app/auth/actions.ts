'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const phone = formData.get('phone') as string
  const telegram = formData.get('telegram') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      data: {
        username,
        phone,
        telegram,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/sign-up-success')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
