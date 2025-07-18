'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Users,
  TrendingUp,
  Search,
  Filter,
  Pin,
  HelpCircle,
  BookOpen,
  Eye,
  Clock,
  Plus
} from 'lucide-react'
import { ThreadCard } from '@/components/forum/thread-card'
import { CreateThreadDialog } from '@/components/forum/create-thread-dialog'
import { getThreads, getCategories } from '@/app/actions/forum'

function ForumContent() {
  const { user, isLoading } = useAuth()
  const [threads, setThreads] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setDataLoading(true)
      // Buscar dados em paralelo
      const [threadsResult, categoriesResult] = await Promise.all([
        getThreads({ limit: 20 }),
        getCategories()
      ])

      setThreads(threadsResult.success ? threadsResult.data : [])
      setCategories(categoriesResult.success ? categoriesResult.data : [])
    } catch (error) {
      console.error('Error loading forum data:', error)
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
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Estatísticas simuladas - em produção viria do banco
  const stats = {
    totalThreads: threads.length,
    totalPosts: threads.reduce((sum, thread) => sum + thread.posts_count, 0),
    activeUsers: 156,
    todayActivity: 23
  }

  // Threads em destaque (fixadas e populares)
  const pinnedThreads = threads.filter(thread => thread.is_pinned)
  const popularThreads = threads
    .filter(thread => !thread.is_pinned)
    .sort((a, b) => (b.views_count + b.posts_count) - (a.views_count + a.posts_count))
    .slice(0, 5)

  const recentThreads = threads
    .filter(thread => !thread.is_pinned)
    .sort((a, b) => new Date(b.last_post_at).getTime() - new Date(a.last_post_at).getTime())

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Fórum da Comunidade
          </h1>
          <p className="text-gray-500 mt-1">
            Compartilhe conhecimentos, tire dúvidas e conecte-se com outros concurseiros
          </p>
        </div>
        
        {user && (
          <CreateThreadDialog categories={categories} />
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Threads
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalThreads}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Posts Totais
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPosts}
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
                  Usuários Ativos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Atividade Hoje
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.todayActivity}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Busca e filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar threads..."
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

          {/* Threads fixadas */}
          {pinnedThreads.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Pin className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Threads Fixadas
                </h2>
              </div>
              <div className="space-y-4">
                {pinnedThreads.map(thread => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    showCategory={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Abas de conteúdo */}
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recentes</TabsTrigger>
              <TabsTrigger value="popular">Populares</TabsTrigger>
              <TabsTrigger value="unanswered">Sem Resposta</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Atividade Recente
                </h2>
                <div className="text-sm text-gray-500">
                  {recentThreads.length} threads
                </div>
              </div>
              
              <div className="space-y-4">
                {recentThreads.length > 0 ? (
                  recentThreads.map(thread => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      showCategory={true}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma thread encontrada
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Seja o primeiro a iniciar uma discussão!
                      </p>
                      {user && (
                        <CreateThreadDialog 
                          categories={categories}
                          trigger={
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Primeira Thread
                            </Button>
                          }
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Threads Populares
                </h2>
                <div className="text-sm text-gray-500">
                  {popularThreads.length} threads
                </div>
              </div>
              
              <div className="space-y-4">
                {popularThreads.map(thread => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    showCategory={true}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="unanswered" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Aguardando Resposta
                </h2>
              </div>
              
              <div className="space-y-4">
                {threads
                  .filter(thread => thread.posts_count === 0 && thread.type === 'question')
                  .map(thread => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      showCategory={true}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categorias */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>
                Explore os tópicos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map(category => (
                <a
                  key={category.id}
                  href={`/forum/categoria/${category.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.threads_count?.length || 0}
                  </Badge>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user ? (
                <>
                  <CreateThreadDialog 
                    categories={categories}
                    trigger={
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Thread
                      </Button>
                    }
                  />
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Minhas Dúvidas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Threads Seguidas
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Faça login para participar do fórum
                  </p>
                  <Button asChild className="w-full">
                    <a href="/auth/signin">
                      Fazer Login
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usuários ativos */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Online</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{stats.activeUsers} usuários online</span>
              </div>
            </CardContent>
          </Card>

          {/* Regras do fórum */}
          <Card>
            <CardHeader>
              <CardTitle>Regras da Comunidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• Seja respeitoso com todos os membros</p>
              <p>• Mantenha o foco nos estudos para concursos</p>
              <p>• Evite spam e autopromoção</p>
              <p>• Use as categorias adequadas</p>
              <p>• Ajude outros concurseiros quando possível</p>
              
              <Button variant="link" className="h-auto p-0 text-blue-600">
                Ver regras completas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ForumPage() {
  return <ForumContent />
}