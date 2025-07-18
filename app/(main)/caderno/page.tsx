'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  Hash,
  Folder,
  Star,
  Pin,
  Calendar,
  BarChart3,
  Link as LinkIcon,
  Grid3X3,
  List
} from 'lucide-react'
import { getNotes, getFolders, getPopularTags, getCadernoStats } from '@/app/actions/caderno'
import { NoteGraph } from '@/components/caderno/note-graph'

function CadernoContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = useState<any[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [popularTags, setPopularTags] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin')
      return
    }
    
    if (user) {
      loadData()
    }
  }, [user, isLoading, router])
  
  const loadData = async () => {
    try {
      setDataLoading(true)
      // Buscar dados em paralelo
      const [notesResult, foldersResult, tagsResult, statsResult] = await Promise.all([
        getNotes({ limit: 100 }),
        getFolders(),
        getPopularTags(),
        getCadernoStats()
      ])

      setNotes(notesResult.success ? notesResult.data : [])
      setFolders(foldersResult.success ? foldersResult.data : [])
      setPopularTags(tagsResult.success ? tagsResult.data : [])
      setStats(statsResult.success ? statsResult.data : null)
    } catch (error) {
      console.error('Error loading caderno data:', error)
    } finally {
      setDataLoading(false)
    }
  }
  
  if (isLoading || dataLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }

  // Separar notas por tipo
  const recentNotes = notes
    .filter(note => note.type === 'note')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)

  const pinnedNotes = notes.filter(note => note.is_pinned)
  const favoriteNotes = notes.filter(note => note.is_favorite)
  const dailyNotes = notes.filter(note => note.type === 'daily')

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Caderno de Estudos
          </h1>
          <p className="text-gray-500 mt-1">
            Organize seu conhecimento com links bidirecionais e visualização em grafo
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button asChild>
            <a href="/caderno/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Nota
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/caderno/daily">
              <Calendar className="h-4 w-4 mr-2" />
              Nota Diária
            </a>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total de Notas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_notes}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total de Palavras
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_words.toLocaleString()}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tempo de Leitura
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.total_read_time / 60)}h
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Esta Semana
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.notes_this_week}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar em todas as notas..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notas fixadas */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Pin className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Notas Fixadas
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedNotes.map(note => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          <a href={`/caderno/${note.slug}`} className="hover:text-blue-600">
                            {note.title}
                          </a>
                        </h3>
                        <Pin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{note.word_count} palavras</span>
                          <span>•</span>
                          <span>{note.read_time_minutes} min</span>
                        </div>
                        <span>
                          {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Abas de conteúdo */}
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
              <TabsTrigger value="daily">Diárias</TabsTrigger>
              <TabsTrigger value="graph">Grafo</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notas Recentes
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentNotes.length > 0 ? (
                  recentNotes.map(note => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 line-clamp-1">
                              <a href={`/caderno/${note.slug}`} className="hover:text-blue-600">
                                {note.title}
                              </a>
                            </h3>
                            
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{note.word_count} palavras</span>
                              <span>{note.read_time_minutes} min de leitura</span>
                              <span>{note.folder_path}</span>
                              <span>
                                Atualizada {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>

                            {note.tags && note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {note.tags.slice(0, 5).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {note.is_favorite && (
                              <Star className="h-4 w-4 text-amber-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {note.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma nota encontrada
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Comece criando sua primeira nota!
                      </p>
                      <Button asChild>
                        <a href="/caderno/nova">
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Nota
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Notas Favoritas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteNotes.map(note => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          <a href={`/caderno/${note.slug}`} className="hover:text-blue-600">
                            {note.title}
                          </a>
                        </h3>
                        <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        {note.word_count} palavras • {note.read_time_minutes} min
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notas Diárias
                </h2>
                <Button asChild>
                  <a href="/caderno/daily">
                    <Calendar className="h-4 w-4 mr-2" />
                    Hoje
                  </a>
                </Button>
              </div>
              
              <div className="space-y-3">
                {dailyNotes.map(note => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900">
                        <a href={`/caderno/${note.slug}`} className="hover:text-blue-600">
                          {note.title}
                        </a>
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(note.created_at).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="graph" className="space-y-4">
              <NoteGraph
                notes={notes as any}
                onNodeClick={(node) => {
                  if (node.type === 'note') {
                    const note = notes.find(n => n.id === node.id)
                    if (note) {
                      window.location.href = `/caderno/${note.slug}`
                    }
                  }
                }}
                height={600}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/caderno/nova">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Nota
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/caderno/daily">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nota Diária
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/caderno/canvas">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Novo Canvas
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Pastas */}
          <Card>
            <CardHeader>
              <CardTitle>Pastas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {folders.map(folder => (
                <a
                  key={folder.id}
                  href={`/caderno/pasta/${folder.path.replace('/', '')}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Folder 
                      className="h-4 w-4" 
                      style={{ color: folder.color }}
                    />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.notes_count?.length || 0}
                  </Badge>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Tags populares */}
          <Card>
            <CardHeader>
              <CardTitle>Tags Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 15).map(({ tag, count }, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-200"
                  >
                    #{tag} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Notas fixadas</span>
                <span className="font-medium">{pinnedNotes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Favoritas</span>
                <span className="font-medium">{favoriteNotes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pastas</span>
                <span className="font-medium">{folders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tags únicas</span>
                <span className="font-medium">{popularTags.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CadernoPage() {
  return <CadernoContent />
}