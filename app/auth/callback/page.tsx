'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // O Supabase automaticamente processa o callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/signin?error=callback_error')
          return
        }

        if (data.session) {
          // Redirecionar para dashboard se autenticado
          router.push('/dashboard')
        } else {
          // Redirecionar para login se não autenticado
          router.push('/auth/signin')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/auth/signin?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF723A]"></div>
    </div>
  )
}