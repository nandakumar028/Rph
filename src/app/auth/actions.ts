'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createOrganization, updateUserProfile } from '@/utils/supabase/queries'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const confirmPassword = formData.get('confirm-password') as string

  if (!email || !password || !name) {
    return { error: 'Name, email, and password are required' }
  }
  
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  // If user is successfully created, generate an organization for them
  if (data.user) {
    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Math.floor(Math.random() * 10000)}`
    const org = await createOrganization(supabase, `${name}'s Org`, subdomain)
    
    if (org) {
      await updateUserProfile(supabase, data.user.id, { org_id: org.id })
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
