'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { forumModerationAI, ContentForModeration } from '@/lib/ai/forum-moderation'
import { SubscriptionLimits, checkFeatureAccess } from '@/lib/middleware/subscription-check'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const supabase = createServerSupabaseClient()

// Schemas de validação
const CreateThreadSchema = z.object({
  category_id: z.string().uuid(),
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200, 'Título muito longo'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres').max(10000, 'Conteúdo muito longo'),
  type: z.enum(['discussion', 'question', 'study_group', 'announcement', 'doubt']).default('discussion'),
  tags: z.array(z.string()).max(5, 'Máximo 5 tags').optional()
})

const CreatePostSchema = z.object({
  thread_id: z.string().uuid(),
  content: z.string().min(1, 'Conteúdo é obrigatório').max(10000, 'Conteúdo muito longo'),
  parent_id: z.string().uuid().optional()
})

const VoteSchema = z.object({
  post_id: z.string().uuid(),
  vote_type: z.enum(['up', 'down'])
})

export type CreateThreadInput = z.infer<typeof CreateThreadSchema>
export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type VoteInput = z.infer<typeof VoteSchema>

// Função para criar thread
export async function createThread(input: CreateThreadInput) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verificar acesso à feature
    const accessCheck = await checkFeatureAccess(session.user.id, 'forum')
    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }
    }

    const validatedInput = CreateThreadSchema.parse(input)

    console.log('🔍 Analisando conteúdo da thread com IA...')

    // Buscar histórico do usuário para moderação
    const { data: userStats } = await supabase
      .from('forum_user_stats')
      .select('reputation_score')
      .eq('user_id', session.user.id)
      .single()

    const { data: userViolations } = await supabase
      .from('forum_moderation_logs')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('action', 'auto_deleted')

    // Preparar conteúdo para moderação
    const contentForModeration: ContentForModeration = {
      type: 'thread',
      title: validatedInput.title,
      content: validatedInput.content,
      author_history: {
        previous_violations: userViolations?.length || 0,
        reputation_score: userStats?.reputation_score || 0,
        account_age_days: 30 // Seria calculado com data de criação da conta
      }
    }

    // Análise de moderação com IA
    const moderationResult = await forumModerationAI.analyzeContent(contentForModeration)

    console.log('🤖 Resultado da moderação IA:', moderationResult)

    // Log da moderação
    await supabase
      .from('forum_moderation_logs')
      .insert({
        content_type: 'thread',
        content_id: 'pending', // Será atualizado após criação
        user_id: session.user.id,
        action: moderationResult.recommended_action,
        reason: moderationResult.explanation,
        confidence_score: moderationResult.confidence_score,
        ai_model: 'gemini-pro',
        moderation_level: moderationResult.confidence_score > 0.8 ? 'automatic' : 'manual',
        metadata: {
          issues: moderationResult.issues,
          severity: moderationResult.severity
        }
      })

    // Decidir status baseado na moderação
    let threadStatus: 'active' | 'under_review' | 'deleted' = 'active'
    
    if (moderationResult.recommended_action === 'auto_delete') {
      return {
        success: false,
        error: 'Conteúdo não atende às diretrizes da comunidade',
        details: moderationResult.explanation
      }
    } else if (moderationResult.recommended_action === 'flag_for_review') {
      threadStatus = 'under_review'
    }

    // Gerar slug único
    const slug = await generateUniqueSlug(validatedInput.title)

    // Sugerir tags automaticamente se não fornecidas
    let finalTags = validatedInput.tags || []
    if (finalTags.length === 0) {
      const suggestedTags = await forumModerationAI.suggestTags(
        validatedInput.content,
        validatedInput.category_id
      )
      finalTags = suggestedTags.slice(0, 3)
    }

    // Criar thread
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .insert({
        category_id: validatedInput.category_id,
        user_id: session.user.id,
        title: validatedInput.title,
        content: validatedInput.content,
        slug: slug,
        type: validatedInput.type,
        status: threadStatus,
        tags: finalTags,
        metadata: {
          moderation_score: moderationResult.confidence_score,
          auto_suggested_tags: finalTags.length > 0 && !validatedInput.tags
        }
      })
      .select()
      .single()

    if (threadError) {
      console.error('Erro ao criar thread:', threadError)
      return { success: false, error: 'Erro ao criar thread' }
    }

    // Atualizar o log de moderação com o ID da thread
    await supabase
      .from('forum_moderation_logs')
      .update({ content_id: thread.id })
      .eq('content_id', 'pending')
      .eq('user_id', session.user.id)

    // Registrar uso da feature
    await SubscriptionLimits.trackFeatureUsage(session.user.id, 'forum', {
      action: 'create_thread',
      category: validatedInput.category_id,
      moderation_status: threadStatus
    })

    revalidatePath('/forum')
    revalidatePath(`/forum/categoria/${validatedInput.category_id}`)

    console.log('✅ Thread criada com sucesso')

    return {
      success: true,
      data: thread,
      message: threadStatus === 'under_review' 
        ? 'Thread criada e enviada para revisão'
        : 'Thread criada com sucesso!',
      moderation: {
        status: threadStatus,
        confidence: moderationResult.confidence_score,
        issues: moderationResult.issues
      }
    }

  } catch (error) {
    console.error('❌ Erro ao criar thread:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para criar post
export async function createPost(input: CreatePostInput) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = CreatePostSchema.parse(input)

    // Verificar se a thread existe e está ativa
    const { data: thread, error: threadError } = await supabase
      .from('forum_threads')
      .select('id, status, title, content')
      .eq('id', validatedInput.thread_id)
      .single()

    if (threadError || !thread) {
      return { success: false, error: 'Thread não encontrada' }
    }

    if (thread.status === 'locked' || thread.status === 'deleted') {
      return { success: false, error: 'Thread está fechada para novos posts' }
    }

    console.log('🔍 Analisando post com IA...')

    // Buscar contexto do post pai se existir
    let parentContent = ''
    if (validatedInput.parent_id) {
      const { data: parentPost } = await supabase
        .from('forum_posts')
        .select('content')
        .eq('id', validatedInput.parent_id)
        .single()
      
      parentContent = parentPost?.content || ''
    }

    // Preparar conteúdo para moderação
    const contentForModeration: ContentForModeration = {
      type: 'post',
      content: validatedInput.content,
      context: {
        parent_content: parentContent,
        thread_topic: thread.title
      }
    }

    // Análise de moderação
    const moderationResult = await forumModerationAI.analyzeContent(contentForModeration)

    // Verificar ação recomendada
    if (moderationResult.recommended_action === 'auto_delete') {
      return {
        success: false,
        error: 'Conteúdo não atende às diretrizes da comunidade',
        details: moderationResult.explanation
      }
    }

    const postStatus = moderationResult.recommended_action === 'flag_for_review' 
      ? 'under_review' 
      : 'active'

    // Criar post
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .insert({
        thread_id: validatedInput.thread_id,
        user_id: session.user.id,
        parent_id: validatedInput.parent_id,
        content: validatedInput.content,
        status: postStatus,
        metadata: {
          moderation_score: moderationResult.confidence_score
        }
      })
      .select()
      .single()

    if (postError) {
      console.error('Erro ao criar post:', postError)
      return { success: false, error: 'Erro ao criar post' }
    }

    // Log de moderação
    await supabase
      .from('forum_moderation_logs')
      .insert({
        content_type: 'post',
        content_id: post.id,
        user_id: session.user.id,
        action: moderationResult.recommended_action,
        reason: moderationResult.explanation,
        confidence_score: moderationResult.confidence_score,
        ai_model: 'gemini-pro',
        moderation_level: moderationResult.confidence_score > 0.8 ? 'automatic' : 'manual',
        metadata: {
          issues: moderationResult.issues,
          severity: moderationResult.severity
        }
      })

    // Criar notificações para seguidores da thread
    await createThreadNotifications(validatedInput.thread_id, session.user.id, post.id)

    revalidatePath(`/forum/thread/${validatedInput.thread_id}`)

    return {
      success: true,
      data: post,
      message: postStatus === 'under_review' 
        ? 'Post criado e enviado para revisão'
        : 'Post criado com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao criar post:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para votar em post
export async function votePost(input: VoteInput) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = VoteSchema.parse(input)

    // Verificar se o post existe
    const { data: post } = await supabase
      .from('forum_posts')
      .select('id, user_id')
      .eq('id', validatedInput.post_id)
      .single()

    if (!post) {
      return { success: false, error: 'Post não encontrado' }
    }

    // Não permitir votar no próprio post
    if (post.user_id === session.user.id) {
      return { success: false, error: 'Você não pode votar no seu próprio post' }
    }

    // Verificar se já votou
    const { data: existingVote } = await supabase
      .from('forum_votes')
      .select('vote_type')
      .eq('post_id', validatedInput.post_id)
      .eq('user_id', session.user.id)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === validatedInput.vote_type) {
        // Remover voto se for o mesmo tipo
        await supabase
          .from('forum_votes')
          .delete()
          .eq('post_id', validatedInput.post_id)
          .eq('user_id', session.user.id)

        return { success: true, message: 'Voto removido' }
      } else {
        // Atualizar voto se for diferente
        await supabase
          .from('forum_votes')
          .update({ vote_type: validatedInput.vote_type })
          .eq('post_id', validatedInput.post_id)
          .eq('user_id', session.user.id)

        return { success: true, message: 'Voto atualizado' }
      }
    } else {
      // Criar novo voto
      await supabase
        .from('forum_votes')
        .insert({
          post_id: validatedInput.post_id,
          user_id: session.user.id,
          vote_type: validatedInput.vote_type
        })

      return { success: true, message: 'Voto registrado' }
    }

  } catch (error) {
    console.error('❌ Erro ao votar:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao votar'
    }
  }
}

// Função para buscar threads
export async function getThreads(filters: {
  category_id?: string
  search?: string
  type?: string
  status?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    const { category_id, search, type, status = 'active', limit = 20, offset = 0 } = filters

    let query = supabase
      .from('forum_threads')
      .select(`
        id,
        title,
        slug,
        type,
        status,
        is_pinned,
        is_solved,
        views_count,
        posts_count,
        last_post_at,
        tags,
        created_at,
        forum_categories(name, slug, color, icon),
        profiles:user_id(full_name, avatar_url),
        last_poster:last_post_by(full_name, avatar_url)
      `)
      .eq('status', status)
      .order('is_pinned', { ascending: false })
      .order('last_post_at', { ascending: false })

    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (type) {
      query = query.eq('type', type)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar threads:', error)
    return {
      success: false,
      error: 'Erro ao carregar threads',
      data: []
    }
  }
}

// Função para buscar thread por ID
export async function getThreadById(id: string) {
  try {
    const { data: thread, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        forum_categories(name, slug, color, icon),
        profiles:user_id(full_name, avatar_url, created_at),
        forum_posts(
          id,
          content,
          is_solution,
          upvotes_count,
          downvotes_count,
          created_at,
          profiles:user_id(full_name, avatar_url),
          parent_id
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    // Incrementar view count
    await supabase
      .from('forum_threads')
      .update({ views_count: thread.views_count + 1 })
      .eq('id', id)

    return { success: true, data: thread }

  } catch (error) {
    console.error('Erro ao buscar thread:', error)
    return {
      success: false,
      error: 'Thread não encontrada',
      data: null
    }
  }
}

// Função para buscar categorias
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('forum_categories')
      .select(`
        *,
        threads_count:forum_threads(count)
      `)
      .eq('is_active', true)
      .order('position')

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return {
      success: false,
      error: 'Erro ao carregar categorias',
      data: []
    }
  }
}

// Funções auxiliares
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)

  let slug = baseSlug
  let counter = 0

  while (true) {
    const { data } = await supabase
      .from('forum_threads')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!data) break

    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}

async function createThreadNotifications(threadId: string, authorId: string, postId: string) {
  // Buscar seguidores da thread
  const { data: followers } = await supabase
    .from('forum_follows')
    .select('user_id')
    .eq('thread_id', threadId)
    .neq('user_id', authorId)

  if (followers && followers.length > 0) {
    const notifications = followers.map(follower => ({
      user_id: follower.user_id,
      thread_id: threadId,
      post_id: postId,
      trigger_user_id: authorId,
      type: 'thread_reply',
      title: 'Nova resposta em thread que você segue',
      content: 'Alguém respondeu em uma thread que você está seguindo'
    }))

    await supabase
      .from('forum_notifications')
      .insert(notifications)
  }
}