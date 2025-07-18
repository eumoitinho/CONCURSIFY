'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Brain,
  Coffee,
  BookOpen,
  RotateCcw,
  Clock,
  Target,
  Zap,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Filter,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react'
import { getSessions } from '@/app/actions/pomodoro'
import { cn } from '@/lib/utils'

interface SessionHistoryProps {
  limit?: number
}

const sessionTypeConfig = {
  focus: { icon: Brain, label: 'Foco', color: 'bg-blue-500' },
  study: { icon: BookOpen, label: 'Estudo', color: 'bg-green-500' },
  review: { icon: RotateCcw, label: 'Revisão', color: 'bg-purple-500' },
  short_break: { icon: Coffee, label: 'Pausa Curta', color: 'bg-orange-500' },
  long_break: { icon: Coffee, label: 'Pausa Longa', color: 'bg-red-500' }
}

const statusConfig = {
  completed: { icon: CheckCircle, label: 'Concluída', color: 'text-green-600' },
  cancelled: { icon: XCircle, label: 'Cancelada', color: 'text-red-600' },
  interrupted: { icon: AlertTriangle, label: 'Interrompida', color: 'text-yellow-600' },
  paused: { icon: Pause, label: 'Pausada', color: 'text-blue-600' },
  in_progress: { icon: Clock, label: 'Em Andamento', color: 'text-purple-600' },
  scheduled: { icon: Calendar, label: 'Agendada', color: 'text-gray-600' }
}

export function SessionHistory({ limit = 20 }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [filters, setFilters] = useState({
    status: '',
    session_type: '',
    date_from: '',
    date_to: ''
  })

  useEffect(() => {
    loadSessions()
  }, [filters])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const result = await getSessions({ 
        ...filters, 
        limit,
        offset: 0 
      })
      
      if (result.success) {
        setSessions(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getProductivityColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const calculateEfficiency = (session: any) => {
    if (!session.actual_duration || !session.planned_duration) return 0
    return Math.round((session.actual_duration / session.planned_duration) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="interrupted">Interrompidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={filters.session_type} onValueChange={(value) => setFilters(prev => ({ ...prev, session_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="focus">Foco</SelectItem>
                  <SelectItem value="study">Estudo</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="short_break">Pausa Curta</SelectItem>
                  <SelectItem value="long_break">Pausa Longa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data inicial</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>

            <div>
              <Label>Data final</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de sessões */}
      <div className="space-y-3">
        {sessions.length > 0 ? (
          sessions.map(session => {
            const sessionType = sessionTypeConfig[session.session_type as keyof typeof sessionTypeConfig]
            const status = statusConfig[session.status as keyof typeof statusConfig]
            const efficiency = calculateEfficiency(session)
            const TypeIcon = sessionType?.icon || Brain
            const StatusIcon = status?.icon || Clock

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Ícone do tipo */}
                      <div className={cn("p-2 rounded-lg text-white", sessionType?.color)}>
                        <TypeIcon className="h-4 w-4" />
                      </div>

                      {/* Informações principais */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {session.task_description || `Sessão de ${sessionType?.label}`}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {sessionType?.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(session.actual_duration || session.planned_duration)}</span>
                            {session.actual_duration && (
                              <span className="text-xs">({efficiency}%)</span>
                            )}
                          </span>
                          
                          {session.subject && (
                            <span className="flex items-center space-x-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{session.subject}</span>
                            </span>
                          )}
                          
                          <span>
                            {new Date(session.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="flex items-center space-x-4 text-sm">
                        {session.productivity_score && (
                          <div className="text-center">
                            <div className={cn("font-medium", getProductivityColor(session.productivity_score))}>
                              {session.productivity_score}
                            </div>
                            <div className="text-xs text-gray-400">Prod.</div>
                          </div>
                        )}
                        
                        {session.focus_score && (
                          <div className="text-center">
                            <div className={cn("font-medium", getProductivityColor(session.focus_score))}>
                              {session.focus_score}
                            </div>
                            <div className="text-xs text-gray-400">Foco</div>
                          </div>
                        )}

                        {session.completion_percentage && (
                          <div className="text-center">
                            <div className="font-medium text-blue-600">
                              {session.completion_percentage}%
                            </div>
                            <div className="text-xs text-gray-400">Concl.</div>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={cn("h-4 w-4", status?.color)} />
                        <span className={cn("text-sm font-medium", status?.color)}>
                          {status?.label}
                        </span>
                      </div>

                      {/* Botão de detalhes */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSession(session)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Sessão</DialogTitle>
                            <DialogDescription>
                              {new Date(session.created_at).toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSession && selectedSession.id === session.id && (
                            <div className="space-y-6">
                              {/* Informações básicas */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Tipo de Sessão</Label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <TypeIcon className="h-4 w-4" />
                                    <span>{sessionType?.label}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Status</Label>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <StatusIcon className={cn("h-4 w-4", status?.color)} />
                                    <span>{status?.label}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Duração Planejada</Label>
                                  <p className="mt-1">{formatDuration(session.planned_duration)}</p>
                                </div>
                                
                                {session.actual_duration && (
                                  <div>
                                    <Label>Duração Real</Label>
                                    <p className="mt-1">{formatDuration(session.actual_duration)} ({efficiency}%)</p>
                                  </div>
                                )}
                              </div>

                              {/* Matéria e tarefa */}
                              {session.subject && (
                                <div>
                                  <Label>Matéria</Label>
                                  <p className="mt-1">{session.subject}</p>
                                </div>
                              )}
                              
                              {session.task_description && (
                                <div>
                                  <Label>Descrição da Tarefa</Label>
                                  <p className="mt-1 text-sm text-gray-600">{session.task_description}</p>
                                </div>
                              )}

                              {/* Objetivos */}
                              {session.goals && session.goals.length > 0 && (
                                <div>
                                  <Label>Objetivos</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {session.goals.map((goal: string, index: number) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {goal}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Métricas de produtividade */}
                              <div className="grid grid-cols-3 gap-4">
                                {session.productivity_score && (
                                  <div>
                                    <Label>Produtividade</Label>
                                    <div className={cn("text-2xl font-bold mt-1", getProductivityColor(session.productivity_score))}>
                                      {session.productivity_score}/10
                                    </div>
                                  </div>
                                )}
                                
                                {session.focus_score && (
                                  <div>
                                    <Label>Foco</Label>
                                    <div className={cn("text-2xl font-bold mt-1", getProductivityColor(session.focus_score))}>
                                      {session.focus_score}/10
                                    </div>
                                  </div>
                                )}
                                
                                {session.energy_level && (
                                  <div>
                                    <Label>Energia Inicial</Label>
                                    <div className="text-2xl font-bold text-blue-600 mt-1">
                                      {session.energy_level}/10
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Notas da sessão */}
                              {session.session_notes && (
                                <div>
                                  <Label>Notas da Sessão</Label>
                                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    {session.session_notes}
                                  </p>
                                </div>
                              )}

                              {/* Conquistas e desafios */}
                              <div className="grid grid-cols-2 gap-4">
                                {session.achievements && session.achievements.length > 0 && (
                                  <div>
                                    <Label>Conquistas</Label>
                                    <ul className="mt-1 text-sm space-y-1">
                                      {session.achievements.map((achievement: string, index: number) => (
                                        <li key={index} className="flex items-center space-x-2">
                                          <Star className="h-3 w-3 text-yellow-500" />
                                          <span>{achievement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {session.challenges && session.challenges.length > 0 && (
                                  <div>
                                    <Label>Desafios</Label>
                                    <ul className="mt-1 text-sm space-y-1">
                                      {session.challenges.map((challenge: string, index: number) => (
                                        <li key={index} className="flex items-center space-x-2">
                                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                                          <span>{challenge}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Interrupções */}
                              {session.session_interruptions && session.session_interruptions.length > 0 && (
                                <div>
                                  <Label>Interrupções ({session.session_interruptions.length})</Label>
                                  <div className="mt-2 space-y-2">
                                    {session.session_interruptions.map((interruption: any) => (
                                      <div key={interruption.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                        <div>
                                          <span className="font-medium capitalize">{interruption.interruption_type}</span>
                                          {interruption.description && (
                                            <span className="text-gray-500 ml-2">- {interruption.description}</span>
                                          )}
                                        </div>
                                        <div className="text-gray-500">
                                          {interruption.duration_seconds}s
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma sessão encontrada
              </h3>
              <p className="text-gray-500">
                Suas sessões Pomodoro aparecerão aqui conforme você as completar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}