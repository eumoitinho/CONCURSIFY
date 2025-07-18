'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BookOpen,
  Brain,
  Award,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { getEstatisticasSimulados } from '@/app/actions/simulados'

interface EstatisticasData {
  total_simulados: number
  simulados_finalizados: number
  media_pontuacao: number
  performance_por_materia: Record<string, { acertos: number; total: number; percentual: number }>
  ultima_atividade: string
}

interface AnalyticsDashboardProps {
  userId: string
  className?: string
}

export function AnalyticsDashboard({ userId, className }: AnalyticsDashboardProps) {
  const [estatisticas, setEstatisticas] = useState<EstatisticasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtroTempo, setFiltroTempo] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadEstatisticas()
  }, [userId, filtroTempo])

  const loadEstatisticas = async () => {
    setLoading(true)
    try {
      const result = await getEstatisticasSimulados()
      if (result.success && result.data) {
        setEstatisticas(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!estatisticas) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum dado disponível
        </h3>
        <p className="text-gray-500">
          Realize alguns simulados para ver suas estatísticas aqui.
        </p>
      </div>
    )
  }

  // Preparar dados para gráficos
  const performanceData = Object.entries(estatisticas.performance_por_materia).map(
    ([materia, stats]) => ({
      materia: materia.length > 15 ? `${materia.substring(0, 15)}...` : materia,
      percentual: stats.percentual,
      acertos: stats.acertos,
      total: stats.total
    })
  )

  const evolutionData = [
    { periodo: 'Sem 1', pontuacao: 45 },
    { periodo: 'Sem 2', pontuacao: 52 },
    { periodo: 'Sem 3', pontuacao: 61 },
    { periodo: 'Sem 4', pontuacao: estatisticas.media_pontuacao }
  ]

  const difficultyData = [
    { name: 'Fácil', value: 35, color: '#10b981' },
    { name: 'Médio', value: 50, color: '#f59e0b' },
    { name: 'Difícil', value: 15, color: '#ef4444' }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com filtros */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500">
            Acompanhe sua evolução nos estudos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total de Simulados
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.total_simulados}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <Badge variant={estatisticas.simulados_finalizados > 0 ? "default" : "secondary"}>
                {estatisticas.simulados_finalizados} finalizados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Média Geral
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.media_pontuacao}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Progress 
                value={estatisticas.media_pontuacao} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Matérias Estudadas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(estatisticas.performance_por_materia).length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Badge variant="outline">
                Diversificação boa
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Última Atividade
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  Hoje
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <Badge variant="default">
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Abas de análises */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="subjects">Matérias</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de performance por matéria */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Matéria</CardTitle>
                <CardDescription>
                  Seu desempenho em cada área de conhecimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="materia" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Aproveitamento']}
                      labelFormatter={(label) => `Matéria: ${label}`}
                    />
                    <Bar 
                      dataKey="percentual" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por dificuldade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dificuldade</CardTitle>
                <CardDescription>
                  Como você se sai em questões de diferentes níveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Performance</CardTitle>
              <CardDescription>
                Acompanhe seu progresso ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Pontuação']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pontuacao" 
                    stroke="#3b82f6" 
                    fill="#3b82f680"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(estatisticas.performance_por_materia).map(([materia, stats]) => (
              <Card key={materia}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {materia}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Aproveitamento</span>
                      <span className="font-medium">{stats.percentual}%</span>
                    </div>
                    <Progress value={stats.percentual} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{stats.acertos} acertos</span>
                      <span>{stats.total} questões</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    {stats.percentual >= 70 ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Muito bom
                      </Badge>
                    ) : stats.percentual >= 50 ? (
                      <Badge variant="secondary">
                        Regular
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Precisa melhorar
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  <Award className="h-5 w-5 inline mr-2" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Consistência nos estudos
                    </p>
                    <p className="text-xs text-green-700">
                      Você tem mantido regularidade na prática
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Bom desempenho em questões médias
                    </p>
                    <p className="text-xs text-green-700">
                      Aproveitamento de 65% neste nível
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  <TrendingDown className="h-5 w-5 inline mr-2" />
                  Áreas de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Questões difíceis
                    </p>
                    <p className="text-xs text-red-700">
                      Apenas 35% de aproveitamento
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Gestão de tempo
                    </p>
                    <p className="text-xs text-red-700">
                      Média de 3.2min por questão (recomendado: 2.5min)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações personalizadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">
                <Brain className="h-5 w-5 inline mr-2" />
                Recomendações Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Próximos Passos</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Foque em questões de nível difícil nas próximas sessões
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Pratique mais questões de Direito Constitucional
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Tente resolver questões em menos tempo
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Meta Sugerida</h4>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      Próxima semana
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                      Alcançar 75% de aproveitamento
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Baseado no seu progresso atual
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}