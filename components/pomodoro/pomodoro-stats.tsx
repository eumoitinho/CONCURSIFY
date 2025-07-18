'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock,
  Target,
  TrendingUp,
  Zap,
  Calendar,
  BarChart3,
  Award,
  Brain,
  Coffee,
  BookOpen,
  Star
} from 'lucide-react'

interface PomodoroStatsProps {
  stats: any
}

export function PomodoroStats({ stats }: PomodoroStatsProps) {
  if (!stats) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sem dados ainda
          </h3>
          <p className="text-gray-500">
            Complete algumas sessões para ver suas estatísticas!
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const weeklyGoal = 25 * 60 // 25 horas por semana
  const weeklyProgress = (stats.weeklyMinutes / weeklyGoal) * 100

  return (
    <div className="space-y-6">
      {/* Resumo da semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Esta Semana</span>
          </CardTitle>
          <CardDescription>
            Seu progresso nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(stats.weeklyMinutes)}
              </div>
              <div className="text-sm text-gray-500">Tempo total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.weeklySessions}
              </div>
              <div className="text-sm text-gray-500">Sessões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.weeklySessions > 0 ? Math.round(stats.weeklyMinutes / stats.weeklySessions) : 0}m
              </div>
              <div className="text-sm text-gray-500">Média/sessão</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Meta semanal</span>
              <span className="text-sm text-gray-500">
                {formatTime(stats.weeklyMinutes)} / {formatTime(weeklyGoal)}
              </span>
            </div>
            <Progress value={Math.min(100, weeklyProgress)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Estatísticas Mensais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">
                {formatTime(stats.monthlyMinutes)}
              </div>
              <div className="text-sm text-gray-600">Tempo total</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600">
                {stats.weeklyStats?.reduce((acc: number, day: any) => acc + day.completed_sessions, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Sessões completas</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600">
                {stats.weeklyStats?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Dias ativos</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-orange-600">
                {stats.recentAchievements?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Conquistas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico semanal */}
      {stats.weeklyStats && stats.weeklyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Semanal</CardTitle>
            <CardDescription>
              Minutos de foco por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.weeklyStats.map((day: any, index: number) => {
                const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
                const dayName = dayNames[new Date(day.date).getDay()]
                const maxMinutes = Math.max(...stats.weeklyStats.map((d: any) => d.total_focus_minutes))
                const percentage = maxMinutes > 0 ? (day.total_focus_minutes / maxMinutes) * 100 : 0

                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 text-sm font-medium">{dayName}</div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-3" />
                    </div>
                    <div className="w-16 text-sm text-right">
                      {formatTime(day.total_focus_minutes)}
                    </div>
                    <div className="w-12 text-xs text-gray-500 text-right">
                      {day.completed_sessions}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conquistas recentes */}
      {stats.recentAchievements && stats.recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Conquistas Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {stats.recentAchievements.slice(0, 5).map((achievement: any) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      +{achievement.points_awarded} pts
                    </Badge>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights e dicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Insights Personalizados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.weeklyMinutes < 60 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Comece devagar</h4>
                <p className="text-sm text-blue-700">
                  Que tal começar com sessões de 15-20 minutos e ir aumentando gradualmente?
                </p>
              </div>
            </div>
          )}

          {stats.weeklySessions >= 10 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <Star className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Excelente consistência!</h4>
                <p className="text-sm text-green-700">
                  Você está mantendo uma ótima frequência de estudos. Continue assim!
                </p>
              </div>
            </div>
          )}

          {stats.weeklyMinutes > 300 && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <Coffee className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">Lembre-se das pausas</h4>
                <p className="text-sm text-purple-700">
                  Você tem estudado muito! Certifique-se de fazer pausas regulares para manter a produtividade.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Dica do dia</h4>
              <p className="text-sm text-gray-700">
                Experimente variar entre sessões de foco, estudo e revisão para manter o cérebro estimulado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}