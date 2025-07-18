'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  MessageSquare, 
  Music, 
  BarChart3, 
  Calendar,
  Star,
  TrendingUp,
  Plus,
  Activity,
  Users,
  Target
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF723A]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Estudante'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Olá, {userName}
              </h1>
              <p className="text-gray-600">
                Bem-vindo ao seu painel de estudos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                Plano Gratuito
              </Badge>
              <Link href="/planos">
                <Button size="sm" className="bg-[#FF723A] hover:bg-[#E55A2B] text-white">
                  Fazer Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cronogramas</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+1 esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Simulados</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">5 restantes este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas de Estudo</p>
                  <p className="text-2xl font-bold text-gray-900">24h</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+3h esta semana</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Desempenho</p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+5% no último mês</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/cronogramas">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#FF723A] hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Criar Cronograma</h3>
                          <p className="text-sm text-gray-600">Gere um cronograma com IA</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/simulados">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#FF723A] hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <BookOpen className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Fazer Simulado</h3>
                          <p className="text-sm text-gray-600">Teste seus conhecimentos</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/pomodoro">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#FF723A] hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Pomodoro</h3>
                          <p className="text-sm text-gray-600">Iniciar sessão de estudos</p>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link href="/spotify">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-[#FF723A] hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-pink-50 rounded-lg">
                          <Music className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Spotify</h3>
                          <p className="text-sm text-gray-600">Música para estudar</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-green-50 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Completou simulado de Direito</p>
                      <p className="text-xs text-gray-500">2 horas atrás</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-blue-50 rounded-full">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Criou cronograma para TCU</p>
                      <p className="text-xs text-gray-500">1 dia atrás</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-purple-50 rounded-full">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Participou do fórum</p>
                      <p className="text-xs text-gray-500">2 dias atrás</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-orange-50 rounded-full">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">Sessão Pomodoro de 25 min</p>
                      <p className="text-xs text-gray-500">3 dias atrás</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/forum">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-50 rounded-full w-fit mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fórum</h3>
                <p className="text-sm text-gray-600">Participe da comunidade</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/caderno">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-50 rounded-full w-fit mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Caderno</h3>
                <p className="text-sm text-gray-600">Organize suas anotações</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planos">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-[#FF723A]">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-orange-50 rounded-full w-fit mx-auto mb-4">
                  <Star className="h-8 w-8 text-[#FF723A]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upgrade</h3>
                <p className="text-sm text-gray-600">Desbloqueie todos os recursos</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}