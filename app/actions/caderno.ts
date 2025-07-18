'use server'

import { createServerClient } from '@/lib/supabase'
import { markdownParser } from '@/lib/caderno/markdown-parser'
import { SubscriptionLimits, checkFeatureAccess } from '@/lib/middleware/subscription-check'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const supabase = createServerClient()

// Schemas de validação
const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  content: z.string().max(100000, 'Conteúdo muito longo'),
  type: z.enum(['note', 'daily', 'template', 'canvas']).default('note'),
  folder_path: z.string().default('/'),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').optional()
})

const UpdateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo').optional(),
  content: z.string().max(100000, 'Conteúdo muito longo').optional(),
  folder_path: z.string().optional(),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').optional(),
  is_pinned: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  view_mode: z.enum(['edit', 'preview', 'split']).optional()
})

const CreateFolderSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  path: z.string(),
  parent_id: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
  icon: z.string().optional()
})

const CreateCanvasSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().optional(),
  canvas_data: z.object({}).default({})
})

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>
export type CreateFolderInput = z.infer<typeof CreateFolderSchema>
export type CreateCanvasInput = z.infer<typeof CreateCanvasSchema>

// Função para criar nota
export async function createNote(input: CreateNoteInput) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verificar acesso à feature
    const accessCheck = await checkFeatureAccess(user.id, 'caderno')
    if (!accessCheck.allowed) {
      return {
        success: false,
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }
    }

    const validatedInput = CreateNoteSchema.parse(input)

    console.log('📝 Criando nova nota...')

    // Gerar slug único
    const slug = await generateUniqueSlug(validatedInput.title, user.id)

    // Processar markdown e extrair metadados
    const parseResult = await markdownParser.parseMarkdown(validatedInput.content)

    // Criar nota
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: validatedInput.title,
        content: validatedInput.content,
        type: validatedInput.type,
        slug: slug,
        folder_path: validatedInput.folder_path,
        tags: validatedInput.tags || [],
        word_count: parseResult.wordCount,
        file_size: validatedInput.content.length,
        read_time_minutes: parseResult.readingTime
      })
      .select()
      .single()

    if (noteError) {
      console.error('Erro ao criar nota:', noteError)
      return { success: false, error: 'Erro ao criar nota' }
    }

    // Criar blocos se existirem
    if (parseResult.blocks.length > 0) {
      const blocks = parseResult.blocks.map(block => ({
        note_id: note.id,
        block_id: block.id,
        content: block.content,
        block_type: block.type,
        position: block.line
      }))

      await supabase
        .from('note_blocks')
        .insert(blocks)
    }

    // Registrar uso da feature
    await SubscriptionLimits.trackFeatureUsage(user.id, 'caderno', {
      action: 'create_note',
      note_type: validatedInput.type,
      word_count: parseResult.wordCount
    })

    revalidatePath('/caderno')
    revalidatePath(`/caderno/${slug}`)

    console.log('✅ Nota criada com sucesso')

    return {
      success: true,
      data: {
        ...note,
        parse_result: parseResult
      },
      message: 'Nota criada com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao criar nota:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para atualizar nota
export async function updateNote(input: UpdateNoteInput) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = UpdateNoteSchema.parse(input)

    // Verificar se a nota pertence ao usuário
    const { data: existingNote, error: fetchError } = await supabase
      .from('notes')
      .select('id, content, title')
      .eq('id', validatedInput.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingNote) {
      return { success: false, error: 'Nota não encontrada' }
    }

    console.log('📝 Atualizando nota...')

    // Preparar dados de atualização
    const updateData: any = {
      last_accessed_at: new Date().toISOString()
    }

    // Se o conteúdo foi atualizado, processar markdown
    if (validatedInput.content !== undefined) {
      const parseResult = await markdownParser.parseMarkdown(validatedInput.content)
      
      updateData.content = validatedInput.content
      updateData.word_count = parseResult.wordCount
      updateData.file_size = validatedInput.content.length
      updateData.read_time_minutes = parseResult.readingTime

      // Atualizar blocos
      await supabase
        .from('note_blocks')
        .delete()
        .eq('note_id', validatedInput.id)

      if (parseResult.blocks.length > 0) {
        const blocks = parseResult.blocks.map(block => ({
          note_id: validatedInput.id,
          block_id: block.id,
          content: block.content,
          block_type: block.type,
          position: block.line
        }))

        await supabase
          .from('note_blocks')
          .insert(blocks)
      }
    }

    // Adicionar outros campos
    if (validatedInput.title !== undefined) updateData.title = validatedInput.title
    if (validatedInput.folder_path !== undefined) updateData.folder_path = validatedInput.folder_path
    if (validatedInput.tags !== undefined) updateData.tags = validatedInput.tags
    if (validatedInput.is_pinned !== undefined) updateData.is_pinned = validatedInput.is_pinned
    if (validatedInput.is_favorite !== undefined) updateData.is_favorite = validatedInput.is_favorite
    if (validatedInput.view_mode !== undefined) updateData.view_mode = validatedInput.view_mode

    // Atualizar nota
    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', validatedInput.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar nota:', updateError)
      return { success: false, error: 'Erro ao atualizar nota' }
    }

    revalidatePath('/caderno')
    revalidatePath(`/caderno/${updatedNote.slug}`)

    return {
      success: true,
      data: updatedNote,
      message: 'Nota atualizada com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar nota:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para buscar notas
export async function getNotes(filters: {
  folder_path?: string
  search?: string
  tags?: string[]
  type?: string
  status?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { 
      folder_path, 
      search, 
      tags, 
      type, 
      status = 'active', 
      limit = 50, 
      offset = 0 
    } = filters

    let query = supabase
      .from('notes')
      .select(`
        id,
        title,
        slug,
        type,
        status,
        folder_path,
        tags,
        word_count,
        read_time_minutes,
        is_pinned,
        is_favorite,
        created_at,
        updated_at,
        last_accessed_at
      `)
      .eq('user_id', user.id)
      .eq('status', status)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })

    if (folder_path) {
      query = query.eq('folder_path', folder_path)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags)
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
    console.error('Erro ao buscar notas:', error)
    return {
      success: false,
      error: 'Erro ao carregar notas',
      data: []
    }
  }
}

// Função para buscar nota por slug
export async function getNoteBySlug(slug: string) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data: note, error } = await supabase
      .from('notes')
      .select(`
        *,
        note_blocks(id, block_id, content, block_type, position),
        incoming_links:note_links!target_note_id(
          id,
          link_text,
          source_note:source_note_id(title, slug)
        ),
        outgoing_links:note_links!source_note_id(
          id,
          link_text,
          target_note:target_note_id(title, slug)
        )
      `)
      .eq('slug', slug)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error) {
      throw error
    }

    // Atualizar último acesso
    await supabase
      .from('notes')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', note.id)

    return { success: true, data: note }

  } catch (error) {
    console.error('Erro ao buscar nota:', error)
    return {
      success: false,
      error: 'Nota não encontrada',
      data: null
    }
  }
}

// Função para criar pasta
export async function createFolder(input: CreateFolderInput) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = CreateFolderSchema.parse(input)

    // Verificar se o caminho já existe
    const { data: existingFolder } = await supabase
      .from('note_folders')
      .select('id')
      .eq('user_id', user.id)
      .eq('path', validatedInput.path)
      .single()

    if (existingFolder) {
      return { success: false, error: 'Pasta já existe neste caminho' }
    }

    const { data: folder, error } = await supabase
      .from('note_folders')
      .insert({
        user_id: user.id,
        name: validatedInput.name,
        path: validatedInput.path,
        parent_id: validatedInput.parent_id,
        color: validatedInput.color || '#3b82f6',
        icon: validatedInput.icon || 'Folder'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    revalidatePath('/caderno')

    return {
      success: true,
      data: folder,
      message: 'Pasta criada com sucesso!'
    }

  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar pasta'
    }
  }
}

// Função para buscar pastas
export async function getFolders() {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('note_folders')
      .select(`
        *,
        notes_count:notes(count)
      `)
      .eq('user_id', user.id)
      .order('path')

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar pastas:', error)
    return {
      success: false,
      error: 'Erro ao carregar pastas',
      data: []
    }
  }
}

// Função para buscar tags populares
export async function getPopularTags() {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data: notes } = await supabase
      .from('notes')
      .select('tags')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('tags', 'is', null)

    if (!notes) return { success: true, data: [] }

    // Contar frequência das tags
    const tagCounts: Record<string, number> = {}
    notes.forEach(note => {
      note.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    // Ordenar por frequência
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    return { success: true, data: popularTags }

  } catch (error) {
    console.error('Erro ao buscar tags:', error)
    return {
      success: false,
      error: 'Erro ao carregar tags',
      data: []
    }
  }
}

// Função para buscar estatísticas do caderno
export async function getCadernoStats() {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Buscar estatísticas em paralelo
    const [
      { count: totalNotes },
      { data: wordStats },
      { data: recentNotes },
      { data: popularTags }
    ] = await Promise.all([
      supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active'),
      
      supabase
        .from('notes')
        .select('word_count, read_time_minutes')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      
      supabase
        .from('notes')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      getPopularTags()
    ])

    const totalWords = wordStats?.reduce((sum, note) => sum + (note.word_count || 0), 0) || 0
    const totalReadTime = wordStats?.reduce((sum, note) => sum + (note.read_time_minutes || 0), 0) || 0

    return {
      success: true,
      data: {
        total_notes: totalNotes || 0,
        total_words: totalWords,
        total_read_time: totalReadTime,
        notes_this_week: recentNotes?.length || 0,
        popular_tags: popularTags.success ? popularTags.data.slice(0, 10) : [],
        last_activity: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      success: false,
      error: 'Erro ao carregar estatísticas',
      data: null
    }
  }
}

// Função auxiliar para gerar slug único
async function generateUniqueSlug(title: string, userId: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .substring(0, 50)

  let slug = baseSlug
  let counter = 0

  while (true) {
    const { data } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single()

    if (!data) break

    counter++
    slug = `${baseSlug}-${counter}`
  }

  return slug
}