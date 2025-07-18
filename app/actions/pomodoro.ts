'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { adaptiveTimer, SessionContext } from '@/lib/pomodoro/adaptive-timer'
import { SubscriptionLimits, checkFeatureAccess } from '@/lib/middleware/subscription-check'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schemas de validação
const CreateSessionSchema = z.object({
  session_type: z.enum(['focus', 'short_break', 'long_break', 'study', 'review']),
  planned_duration: z.number().min(1).max(300),
  note_id: z.string().uuid().optional(),
  subject: z.string().optional(),
  task_description: z.string().optional(),
  goals: z.array(z.string()).optional(),
  energy_level: z.number().min(1).max(10).optional(),
  environment: z.string().optional(),
  background_noise: z.string().optional()
})

const UpdateSessionSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'paused', 'cancelled', 'interrupted']).optional(),
  actual_duration: z.number().min(0).optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  productivity_score: z.number().min(1).max(10).optional(),
  focus_score: z.number().min(1).max(10).optional(),
  energy_level_end: z.number().min(1).max(10).optional(),
  mood_after: z.string().optional(),
  session_notes: z.string().optional(),
  pages_read: z.number().min(0).optional(),
  exercises_completed: z.number().min(0).optional(),
  notes_created: z.number().min(0).optional(),
  words_written: z.number().min(0).optional(),
  concepts_learned: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  challenges: z.array(z.string()).optional()
})

const AddInterruptionSchema = z.object({
  session_id: z.string().uuid(),
  interruption_type: z.enum(['external', 'internal', 'urgent', 'distraction', 'technical']),
  description: z.string().optional(),
  duration_seconds: z.number().min(1),
  impact_level: z.number().min(1).max(5).optional(),
  handled_well: z.boolean().optional()
})

const UpdateSettingsSchema = z.object({
  focus_duration: z.number().min(10).max(120).optional(),
  short_break_duration: z.number().min(1).max(30).optional(),
  long_break_duration: z.number().min(5).max(60).optional(),
  cycles_before_long_break: z.number().min(2).max(10).optional(),
  adaptive_mode: z.boolean().optional(),
  sound_enabled: z.boolean().optional(),
  sound_type: z.string().optional(),
  sound_volume: z.number().min(0).max(100).optional(),
  auto_start_breaks: z.boolean().optional(),
  auto_start_focus: z.boolean().optional(),
  daily_goal_sessions: z.number().min(1).max(20).optional(),
  weekly_goal_hours: z.number().min(1).max(100).optional()
})

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>
export type UpdateSessionInput = z.infer<typeof UpdateSessionSchema>
export type AddInterruptionInput = z.infer<typeof AddInterruptionSchema>
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>

// Função para criar sessão
export async function createSession(input: CreateSessionInput) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verificar acesso à feature
    const accessCheck = await checkFeatureAccess(user.id, 'pomodoro')
    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }
    }

    const validatedInput = CreateSessionSchema.parse(input)

    console.log('⏰ Criando nova sessão Pomodoro...')

    // Criar sessão no banco
    const { data: newSession, error: sessionError } = await supabase
      .from('pomodoro_sessions')
      .insert({
        user_id: user.id,
        session_type: validatedInput.session_type,
        planned_duration: validatedInput.planned_duration,
        note_id: validatedInput.note_id,
        subject: validatedInput.subject,
        task_description: validatedInput.task_description,
        goals: validatedInput.goals || [],
        energy_level: validatedInput.energy_level,
        environment: validatedInput.environment,
        background_noise: validatedInput.background_noise,
        scheduled_start: new Date().toISOString(),
        status: 'scheduled'
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Erro ao criar sessão:', sessionError)
      return { success: false, error: 'Erro ao criar sessão' }
    }

    // Registrar uso da feature
    await SubscriptionLimits.trackFeatureUsage(user.id, 'pomodoro', {
      session_type: validatedInput.session_type,
      duration: validatedInput.planned_duration
    })

    revalidatePath('/pomodoro')

    console.log('✅ Sessão Pomodoro criada com sucesso')

    return {
      success: true,
      data: newSession,
      message: 'Sessão criada com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao criar sessão:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para iniciar sessão
export async function startSession(sessionId: string) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Pausar qualquer sessão ativa do usuário
    await supabase
      .from('pomodoro_sessions')
      .update({ 
        status: 'paused',
        paused_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'in_progress')

    // Iniciar a sessão selecionada
    const { data: updatedSession, error } = await supabase
      .from('pomodoro_sessions')
      .update({
        status: 'in_progress',
        actual_start: new Date().toISOString(),
        paused_at: null
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/pomodoro')

    return {
      success: true,
      data: updatedSession,
      message: 'Sessão iniciada!'
    }

  } catch (error) {
    console.error('Erro ao iniciar sessão:', error)
    return {
      success: false,
      error: 'Erro ao iniciar sessão'
    }
  }
}

// Função para atualizar sessão
export async function updateSession(input: UpdateSessionInput) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = UpdateSessionSchema.parse(input)

    const updateData: any = {}

    // Mapear campos opcionais
    if (validatedInput.status !== undefined) updateData.status = validatedInput.status
    if (validatedInput.actual_duration !== undefined) updateData.actual_duration = validatedInput.actual_duration
    if (validatedInput.completion_percentage !== undefined) updateData.completion_percentage = validatedInput.completion_percentage
    if (validatedInput.productivity_score !== undefined) updateData.productivity_score = validatedInput.productivity_score
    if (validatedInput.focus_score !== undefined) updateData.focus_score = validatedInput.focus_score
    if (validatedInput.energy_level_end !== undefined) updateData.energy_level_end = validatedInput.energy_level_end
    if (validatedInput.mood_after !== undefined) updateData.mood_after = validatedInput.mood_after
    if (validatedInput.session_notes !== undefined) updateData.session_notes = validatedInput.session_notes
    if (validatedInput.pages_read !== undefined) updateData.pages_read = validatedInput.pages_read
    if (validatedInput.exercises_completed !== undefined) updateData.exercises_completed = validatedInput.exercises_completed
    if (validatedInput.notes_created !== undefined) updateData.notes_created = validatedInput.notes_created
    if (validatedInput.words_written !== undefined) updateData.words_written = validatedInput.words_written
    if (validatedInput.concepts_learned !== undefined) updateData.concepts_learned = validatedInput.concepts_learned
    if (validatedInput.achievements !== undefined) updateData.achievements = validatedInput.achievements
    if (validatedInput.challenges !== undefined) updateData.challenges = validatedInput.challenges

    // Se está completando a sessão, adicionar timestamp
    if (validatedInput.status === 'completed') {
      updateData.actual_end = new Date().toISOString()
    }

    updateData.updated_at = new Date().toISOString()

    const { data: updatedSession, error } = await supabase
      .from('pomodoro_sessions')
      .update(updateData)
      .eq('id', validatedInput.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/pomodoro')

    return {
      success: true,
      data: updatedSession,
      message: 'Sessão atualizada com sucesso!'
    }

  } catch (error) {
    console.error('Erro ao atualizar sessão:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar sessão'
    }
  }
}

// Função para adicionar interrupção
export async function addInterruption(input: AddInterruptionInput) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = AddInterruptionSchema.parse(input)

    // Verificar se a sessão pertence ao usuário
    const { data: sessionData, error: sessionError } = await supabase
      .from('pomodoro_sessions')
      .select('id')
      .eq('id', validatedInput.session_id)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !sessionData) {
      return { success: false, error: 'Sessão não encontrada' }
    }

    // Adicionar interrupção
    const { data: interruption, error } = await supabase
      .from('session_interruptions')
      .insert({
        session_id: validatedInput.session_id,
        interruption_type: validatedInput.interruption_type,
        description: validatedInput.description,
        duration_seconds: validatedInput.duration_seconds,
        impact_level: validatedInput.impact_level,
        handled_well: validatedInput.handled_well,
        occurred_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      data: interruption,
      message: 'Interrupção registrada'
    }

  } catch (error) {
    console.error('Erro ao registrar interrupção:', error)
    return {
      success: false,
      error: 'Erro ao registrar interrupção'
    }
  }
}

// Função para buscar sessões
export async function getSessions(filters: {
  status?: string
  session_type?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { status, session_type, date_from, date_to, limit = 50, offset = 0 } = filters

    let query = supabase
      .from('pomodoro_sessions')
      .select(`
        *,
        session_interruptions(count),
        notes(title, slug)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (session_type) {
      query = query.eq('session_type', session_type)
    }

    if (date_from) {
      query = query.gte('actual_start', date_from)
    }

    if (date_to) {
      query = query.lte('actual_start', date_to)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar sessões:', error)
    return {
      success: false,
      error: 'Erro ao carregar sessões',
      data: []
    }
  }
}

// Função para buscar sessão ativa
export async function getActiveSession() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select(`
        *,
        notes(title, slug),
        session_interruptions(*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return { success: true, data: data || null }

  } catch (error) {
    console.error('Erro ao buscar sessão ativa:', error)
    return {
      success: false,
      error: 'Erro ao buscar sessão ativa',
      data: null
    }
  }
}

// Função para obter recomendação adaptativa
export async function getAdaptiveRecommendation(context: SessionContext) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Buscar histórico de sessões do usuário
    const { data: sessions } = await supabase
      .from('pomodoro_sessions')
      .select('planned_duration, actual_duration, completion_percentage, productivity_score, focus_score, actual_start')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('actual_start', { ascending: false })
      .limit(100)

    if (!sessions || sessions.length < 3) {
      return {
        success: true,
        data: {
          recommendedDuration: 25,
          confidence: 0.5,
          reasoning: 'Histórico insuficiente, usando duração padrão',
          factors: [],
          alternativeDurations: [
            { duration: 20, probability: 0.7, reason: 'Versão mais curta' },
            { duration: 30, probability: 0.6, reason: 'Versão mais longa' }
          ]
        }
      }
    }

    // Calcular performance do usuário
    const userPerformance = adaptiveTimer.calculatePerformanceMetrics(sessions)

    // Obter recomendação adaptativa
    const recommendation = await adaptiveTimer.calculateOptimalDuration(userPerformance, context)

    return {
      success: true,
      data: recommendation
    }

  } catch (error) {
    console.error('Erro ao obter recomendação adaptativa:', error)
    return {
      success: false,
      error: 'Erro ao calcular recomendação'
    }
  }
}

// Função para atualizar configurações
export async function updateSettings(input: UpdateSettingsInput) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = UpdateSettingsSchema.parse(input)

    const { data, error } = await supabase
      .from('pomodoro_settings')
      .upsert({
        user_id: user.id,
        ...validatedInput,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/pomodoro')

    return {
      success: true,
      data,
      message: 'Configurações atualizadas!'
    }

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return {
      success: false,
      error: 'Erro ao atualizar configurações'
    }
  }
}

// Função para buscar configurações
export async function getSettings() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('pomodoro_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Se não existe, criar configurações padrão
    if (!data) {
      const { data: defaultSettings } = await supabase
        .from('pomodoro_settings')
        .insert({ user_id: session.user.id })
        .select()
        .single()

      return { success: true, data: defaultSettings }
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return {
      success: false,
      error: 'Erro ao carregar configurações'
    }
  }
}

// Função para buscar estatísticas
export async function getPomodoroStats() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Buscar estatísticas da semana atual
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const { data: weeklyStats } = await supabase
      .from('pomodoro_daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStart.toISOString().split('T')[0])

    // Buscar estatísticas do mês atual
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { data: monthlyStats } = await supabase
      .from('pomodoro_daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', monthStart.toISOString().split('T')[0])

    // Buscar conquistas
    const { data: achievements } = await supabase
      .from('pomodoro_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(10)

    // Calcular totais
    const weekTotal = weeklyStats?.reduce((sum, day) => sum + day.total_focus_minutes, 0) || 0
    const monthTotal = monthlyStats?.reduce((sum, day) => sum + day.total_focus_minutes, 0) || 0
    const weekSessions = weeklyStats?.reduce((sum, day) => sum + day.completed_sessions, 0) || 0

    return {
      success: true,
      data: {
        weeklyMinutes: weekTotal,
        monthlyMinutes: monthTotal,
        weeklySessions: weekSessions,
        recentAchievements: achievements || [],
        weeklyStats: weeklyStats || [],
        monthlyStats: monthlyStats || []
      }
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      success: false,
      error: 'Erro ao carregar estatísticas'
    }
  }
}