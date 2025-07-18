'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Play,
  Pause,
  Square,
  Timer,
  Brain,
  Coffee,
  TrendingUp,
  Settings,
  Award,
  BarChart3,
  Calendar,
  Target,
  Clock,
  Zap
} from 'lucide-react'
import { getPomodoroStats, getActiveSession, getSettings } from '@/app/actions/pomodoro'
import { PomodoroTimer } from '@/components/pomodoro/pomodoro-timer'
import { SessionHistory } from '@/components/pomodoro/session-history'
import { PomodoroSettings } from '@/components/pomodoro/pomodoro-settings'
import { SessionCreateForm } from '@/components/pomodoro/session-create-form'
import { PomodoroStats } from '@/components/pomodoro/pomodoro-stats'

function PomodoroContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [activeSession, setActiveSession] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
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
      const [statsResult, activeSessionResult, settingsResult] = await Promise.all([
        getPomodoroStats(),
        getActiveSession(),
        getSettings()
      ])

      setStats(statsResult.success ? statsResult.data : null)
      setActiveSession(activeSessionResult.success ? activeSessionResult.data : null)
      setSettings(settingsResult.success ? settingsResult.data : null)
    } catch (error) {
      console.error('Error loading pomodoro data:', error)
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
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pomodoro Integrado
          </h1>
          <p className="text-gray-500 mt-1">
            Timer adaptativo com IA para maximizar sua produtividade
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/pomodoro/nova-sessao">
              <Play className="h-4 w-4 mr-2" />
              Nova Sessão
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/pomodoro/configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </a>
          </Button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Esta Semana
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.weeklyMinutes / 60)}h {stats.weeklyMinutes % 60}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Sessões Completas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.weeklySessions}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Este Mês
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.monthlyMinutes / 60)}h
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Conquistas
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.recentAchievements.length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Timer className="h-5 w-5" />
                <span>Timer Pomodoro</span>
                {activeSession && (
                  <Badge variant="secondary" className="ml-2">
                    {activeSession.session_type}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {activeSession 
                  ? `Sessão em andamento: ${activeSession.task_description || 'Sem descrição'}`
                  : 'Nenhuma sessão ativa no momento'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PomodoroTimer 
                activeSession={activeSession} 
                settings={settings}
              />
            </CardContent>
          </Card>

          {/* Tabs de conteúdo */}
          <div className="mt-6">
            <Tabs defaultValue="history" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                <TabsTrigger value="achievements">Conquistas</TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <SessionHistory />
              </TabsContent>

              <TabsContent value="stats">
                <PomodoroStats stats={stats} />
              </TabsContent>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle>Conquistas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.recentAchievements.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentAchievements.map(achievement => (
                          <div key={achievement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-gray-500">{achievement.description}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              +{achievement.points_awarded} pts
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Nenhuma conquista ainda
                        </h3>
                        <p className="text-gray-500">
                          Complete sessões para desbloquear conquistas!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sessão ativa */}
          {activeSession ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span>Sessão Ativa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  <Badge variant="outline">
                    {activeSession.session_type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">{activeSession.planned_duration}min</span>
                </div>
                {activeSession.subject && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Matéria:</span>
                    <span className="font-medium">{activeSession.subject}</span>
                  </div>
                )}
                {activeSession.energy_level && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Energia:</span>
                    <span className="font-medium">{activeSession.energy_level}/10</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    asChild
                  >
                    <a href={`/pomodoro/sessao/${activeSession.id}`}>
                      Ver Detalhes
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nova Sessão</CardTitle>
                <CardDescription>
                  Configure uma nova sessão Pomodoro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionCreateForm settings={settings} />
              </CardContent>
            </Card>
          )}

          {/* Templates rápidos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Brain className="h-4 w-4 mr-2" />
                Foco Intenso (25min)
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Coffee className="h-4 w-4 mr-2" />
                Pausa Ativa (5min)
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Estudo Profundo (45min)
              </Button>
            </CardContent>
          </Card>

          {/* Configurações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duração foco:</span>
                <span className="font-medium">{settings?.focus_duration || 25}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pausa curta:</span>
                <span className="font-medium">{settings?.short_break_duration || 5}min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Modo adaptativo:</span>
                <Badge variant={settings?.adaptive_mode ? "default" : "secondary"}>
                  {settings?.adaptive_mode ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Som:</span>
                <Badge variant={settings?.sound_enabled ? "default" : "secondary"}>
                  {settings?.sound_enabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  asChild
                >
                  <a href="/pomodoro/configuracoes">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meta diária */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meta Diária</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats?.weeklySessions || 0}/{settings?.daily_goal_sessions || 8}
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  sessões hoje
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((stats?.weeklySessions || 0) / (settings?.daily_goal_sessions || 8)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PomodoroPage() {
  return <PomodoroContent />
}