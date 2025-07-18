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
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Still loading
    
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-[20%] w-32 h-32 bg-orange-500 bg-opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-[15%] w-40 h-40 bg-orange-300 bg-opacity-20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-[5%] w-24 h-24 bg-orange-400 bg-opacity-15 rounded-full blur-xl"></div>
      </div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 border-b-4 border-gray-800 shadow-[0_4px_0px_0px_#2d2d2d] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Olá, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Estudante'}! 👋
              </h1>
              <p className="text-orange-100 text-lg">
                Bem-vindo ao seu painel de estudos com IA
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white bg-opacity-20 text-white border-2 border-white backdrop-blur-sm">
                Plano Gratuito
              </Badge>
              <Link href="/planos">
                <Button size="sm" className="bg-white text-orange-500 hover:bg-orange-50">
                  Fazer Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cronogramas</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
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
                <BookOpen className="h-8 w-8 text-orange-500" />
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
                <Clock className="h-8 w-8 text-orange-500" />
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
                <TrendingUp className="h-8 w-8 text-orange-500" />
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
                        <div className="p-6 border-2 border-gray-800 rounded-xl hover:bg-orange-100 transition-all duration-300 cursor-pointer shadow-[3px_3px_0px_0px_#2d2d2d] hover:shadow-[5px_5px_0px_0px_#2d2d2d] hover:-translate-y-1">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 rounded-full bg-orange-500 border-2 border-gray-800">
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
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
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
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
            <Card className="cursor-pointer group">
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-16 w-16 text-orange-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Fórum</h3>
                <p className="text-sm text-gray-600">Participe da comunidade de concurseiros</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/caderno">
            <Card className="cursor-pointer group">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-16 w-16 text-orange-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Caderno</h3>
                <p className="text-sm text-gray-600">Organize suas anotações e materiais</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planos">
            <Card className="cursor-pointer group bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600">
              <CardContent className="p-8 text-center">
                <Star className="h-16 w-16 text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-white mb-3 text-lg">Upgrade</h3>
                <p className="text-sm text-orange-100">Desbloqueie todos os recursos</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}