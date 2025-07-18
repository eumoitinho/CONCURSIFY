'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  location: string | null
  concursos_interesse: string[]
  nivel_estudos: 'iniciante' | 'intermediario' | 'avancado'
  created_at: string
  updated_at: string
}

interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start: string
  current_period_end: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  subscription: UserSubscription | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signInWithGoogle: () => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshProfile: () => Promise<void>
  isPremium: boolean
  hasFeatureAccess: (feature: string) => boolean
  getRemainingUsage: (feature: string) => Promise<number>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Configurações de limites por plano
  const PLAN_LIMITS = {
    free: {
      cronogramas: 1,
      simulados: 3,
      notas: 10,
      forum_posts: 3,
      pomodoro_sessions: 5,
      spotify_playlists: 1
    },
    premium: {
      cronogramas: -1, // ilimitado
      simulados: -1,
      notas: -1,
      forum_posts: -1,
      pomodoro_sessions: -1,
      spotify_playlists: -1
    }
  }

  // Verificar se o usuário tem plano premium
  const isPremium = subscription?.status === 'active'

  // Verificar se tem acesso a uma funcionalidade
  const hasFeatureAccess = (feature: string): boolean => {
    if (isPremium) return true
    
    const blockedFeatures = [
      'adaptive_simulados',
      'advanced_reports',
      'note_search',
      'bidirectional_links',
      'backup',
      'custom_pomodoro',
      'spotify_premium',
      'pdf_clean'
    ]
    
    return !blockedFeatures.includes(feature)
  }

  // Obter uso restante de uma funcionalidade
  const getRemainingUsage = async (feature: string): Promise<number> => {
    if (!user || isPremium) return -1 // ilimitado para premium
    
    const planLimit = PLAN_LIMITS.free[feature as keyof typeof PLAN_LIMITS.free]
    if (planLimit === -1) return -1
    
    // Buscar uso atual do mês
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('user_id', user.id)
      .eq('feature', feature)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .single()
    
    const currentUsage = usage?.count || 0
    return Math.max(0, planLimit - currentUsage)
  }

  // Carregar perfil do usuário (simplificado)
  const loadUserProfile = async (userId: string) => {
    try {
      // Tentar carregar perfil
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (profileData) {
        setProfile(profileData)
      }

      // Definir assinatura padrão gratuita
      setSubscription({
        id: 'free-default',
        user_id: userId,
        plan_id: 'free-plan',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      } as UserSubscription)
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      // Mesmo com erro, definir plano gratuito
      setSubscription({
        id: 'free-default',
        user_id: userId,
        plan_id: 'free-plan',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      } as UserSubscription)
    }
  }

  // Criar perfil inicial para novo usuário
  const createUserProfile = async (userId: string, email: string, metadata: any = {}) => {
    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          display_name: metadata.name || email.split('@')[0],
          bio: null,
          avatar_url: null,
          location: null,
          concursos_interesse: [],
          nivel_estudos: 'iniciante'
        })
        .select()
        .single()
      
      if (error) throw error
      
      // Criar configurações padrão do usuário
      await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          notifications: { email: true, push: true },
          theme: 'light',
          language: 'pt-BR',
          pomodoro_duration: 25,
          break_duration: 5
        })
      
      // Criar preferências musicais padrão
      await supabase
        .from('music_preferences')
        .insert({
          user_id: userId,
          preferred_genres: ['lo-fi', 'classical', 'ambient'],
          spotify_connected: false,
          auto_play: false,
          volume_level: 50
        })
      
      setProfile(profileData)
      return profileData
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      throw error
    }
  }

  // Função de cadastro
  const signUp = async (email: string, password: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error
      
      if (data.user && data.user.id) {
        // Criar perfil do usuário
        await createUserProfile(data.user.id, email, metadata)
      }
      
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Erro no cadastro:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Login bem-sucedido - o onAuthStateChange vai lidar com o resto
      return { user: data.user, error: null }
    } catch (error) {
      console.error('Erro no login:', error)
      setIsLoading(false)
      return { user: null, error: error as AuthError }
    }
  }

  // Função de login com Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
      
      return { user: null, error: null } // OAuth redireciona, não retorna user diretamente
    } catch (error) {
      console.error('Erro no login com Google:', error)
      return { user: null, error: error as AuthError }
    }
  }

  // Função de logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      setSubscription(null)
      setSession(null)
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  // Função de recuperação de senha
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) throw error
      
      return { error: null }
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error)
      return { error: error as AuthError }
    }
  }

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      setProfile(data)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  // Recarregar perfil
  const refreshProfile = async () => {
    if (!user) return
    await loadUserProfile(user.id)
  }

  // Escutar mudanças de autenticação
  useEffect(() => {
    let mounted = true

    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          setSession(session)
          await loadUserProfile(session.user.id)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Erro ao carregar sessão inicial:', error)
        if (mounted) setIsLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
          // Redirecionar para dashboard após login bem-sucedido
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfile(null)
          setSubscription(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        session,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
        isPremium,
        hasFeatureAccess,
        getRemainingUsage
      }}
    >
      {children}
    </AuthContext.Provider>
  )
} 