'use client'

import { useSession } from 'next-auth/react'
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
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF723A]"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const quickActions = [
    {
      title: 'Criar Cronograma',
      description: 'Gere um cronograma personalizado com IA',
      icon: Calendar,
      href: '/cronogramas',
      color: 'bg-blue-500'
    },
    {
      title: 'Fazer Simulado',
      description: 'Teste seus conhecimentos',
      icon: BookOpen,
      href: '/simulados',
      color: 'bg-green-500'
    },
    {
      title: 'Pomodoro',
      description: 'Iniciar sessão de estudos',
      icon: Clock,
      href: '/pomodoro',
      color: 'bg-purple-500'
    },
    {
      title: 'Spotify',
      description: 'Música para estudar',
      icon: Music,
      href: '/spotify',
      color: 'bg-pink-500'
    }
  ]

  const recentActivity = [
    { action: 'Completou simulado de Direito Constitucional', time: '2 horas atrás' },
    { action: 'Criou cronograma para TCU', time: '1 dia atrás' },
    { action: 'Participou do fórum', time: '2 dias atrás' },
    { action: 'Sessão Pomodoro de 25 min', time: '3 dias atrás' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Olá, {session.user?.name || 'Estudante'}! 👋
              </h1>
              <p className="text-gray-600">
                Bem-vindo ao seu painel de estudos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-[#FF723A]">
                Plano Gratuito
              </Badge>
              <Link href="/planos">
                <Button size="sm" className="bg-[#FF723A] hover:bg-[#E55A2B]">
                  Fazer Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cronogramas</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Calendar className="h-8 w-8 text-[#FF723A]" />
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
                <BookOpen className="h-8 w-8 text-[#FF723A]" />
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
                <Clock className="h-8 w-8 text-[#FF723A]" />
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
                <TrendingUp className="h-8 w-8 text-[#FF723A]" />
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
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} href={action.href}>
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${action.color}`}>
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{action.title}</h3>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#FF723A] rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/forum">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-[#FF723A] mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Fórum</h3>
                <p className="text-sm text-gray-600">Participe da comunidade de concurseiros</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/caderno">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-[#FF723A] mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Caderno</h3>
                <p className="text-sm text-gray-600">Organize suas anotações e materiais</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-[#FF723A] border-2">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 text-[#FF723A] mx-auto mb-4" />
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