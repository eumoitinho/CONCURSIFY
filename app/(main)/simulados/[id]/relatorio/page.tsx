import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getSimuladoById } from '@/app/actions/simulados'
import { PerformanceCharts } from '@/components/simulados/performance-charts'
import { AnalyticsDashboard } from '@/components/simulados/analytics-dashboard'
import {
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BarChart3
} from 'lucide-react'

interface SimuladoRelatorioPageProps {
  params: {
    id: string
  }
}

async function SimuladoRelatorioContent({ id }: { id: string }) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const result = await getSimuladoById(id)
  
  if (!result.success || !result.data) {
    notFound()
  }

  const { simulado, respostas } = result.data

  if (simulado.status !== 'finalizado') {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Simulado ainda não finalizado
            </h2>
            <p className="text-gray-500 text-center mb-6">
              O relatório só estará disponível após a conclusão do simulado.
            </p>
            <Button asChild>
              <a href={`/simulados/${id}`}>
                Continuar Simulado
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular estatísticas
  const totalQuestoes = respostas?.length || 0
  const acertos = respostas?.filter(r => r.is_correct).length || 0
  const pontuacaoCalculada = totalQuestoes > 0 ? (acertos / totalQuestoes) * 100 : 0
  const pontuacao = simulado.pontuacao || pontuacaoCalculada

  // Calcular tempo total
  const tempoTotal = simulado.tempo_fim && simulado.tempo_inicio
    ? Math.round((new Date(simulado.tempo_fim).getTime() - new Date(simulado.tempo_inicio).getTime()) / (1000 * 60))
    : 0

  // Preparar dados por matéria
  const performancePorMateria: Record<string, { acertos: number; total: number; percentual: number }> = {}
  
  respostas?.forEach(resposta => {
    const materia = resposta.questoes.materia
    if (!performancePorMateria[materia]) {
      performancePorMateria[materia] = { acertos: 0, total: 0, percentual: 0 }
    }
    performancePorMateria[materia].total++
    if (resposta.is_correct) {
      performancePorMateria[materia].acertos++
    }
  })

  Object.keys(performancePorMateria).forEach(materia => {
    const stats = performancePorMateria[materia]
    stats.percentual = (stats.acertos / stats.total) * 100
  })

  // Preparar dados para gráficos
  const chartData = {
    performancePorMateria,
    evolucaoTemporal: [
      { periodo: 'Anterior', pontuacao: Math.max(0, pontuacao - 15), data: '2024-01-01' },
      { periodo: 'Atual', pontuacao: pontuacao, data: new Date().toISOString() }
    ],
    distribuicaoDificuldade: [
      { nivel: 'Fácil', acertos: 0, total: 0, percentual: 0 },
      { nivel: 'Médio', acertos: 0, total: 0, percentual: 0 },
      { nivel: 'Difícil', acertos: 0, total: 0, percentual: 0 }
    ],
    temposPorQuestao: respostas?.map((r, index) => ({
      questao: index + 1,
      tempo: r.tempo_resposta,
      materia: r.questoes.materia
    })) || []
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/simulados/${id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'pdf' })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `simulado-${id}-relatorio.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Relatório de Desempenho
          </h1>
          <p className="text-gray-500 mt-1">
            {simulado.titulo} • {new Date(simulado.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pontuação Final
                </p>
                <p className={`text-2xl font-bold ${
                  pontuacao >= 70 ? 'text-green-600' : 
                  pontuacao >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {pontuacao.toFixed(1)}%
                </p>
              </div>
              <Target className={`h-8 w-8 ${
                pontuacao >= 70 ? 'text-green-500' : 
                pontuacao >= 50 ? 'text-amber-500' : 'text-red-500'
              }`} />
            </div>
            <div className="mt-4">
              <Badge variant={pontuacao >= 70 ? "default" : pontuacao >= 50 ? "secondary" : "destructive"}>
                {pontuacao >= 70 ? 'Excelente' : pontuacao >= 50 ? 'Bom' : 'Precisa melhorar'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Questões Certas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {acertos}/{totalQuestoes}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${pontuacao}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Tempo Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tempoTotal}min
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-4">
              <Badge variant="outline">
                {totalQuestoes > 0 
                  ? `${(tempoTotal / totalQuestoes).toFixed(1)}min/questão`
                  : 'N/A'
                }
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Matérias
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(performancePorMateria).length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <Badge variant="secondary">
                Cobertura diversificada
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Análise Detalhada
          </CardTitle>
          <CardDescription>
            Visualize seu desempenho em diferentes aspectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceCharts data={chartData} />
        </CardContent>
      </Card>

      {/* Performance por Matéria */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Matéria</CardTitle>
          <CardDescription>
            Análise detalhada do seu aproveitamento em cada área
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(performancePorMateria).map(([materia, stats]) => (
              <div key={materia} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{materia}</h4>
                  <Badge variant={stats.percentual >= 70 ? "default" : stats.percentual >= 50 ? "secondary" : "destructive"}>
                    {stats.percentual.toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        stats.percentual >= 70 ? 'bg-green-500' : 
                        stats.percentual >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stats.percentual}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{stats.acertos} acertos</span>
                    <span>{stats.total} questões</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center text-sm">
                  {stats.percentual >= 70 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-700">Muito bom</span>
                    </>
                  ) : stats.percentual >= 50 ? (
                    <>
                      <span className="text-amber-700">Regular</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-700">Precisa melhorar</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Questões Detalhadas */}
      {respostas && respostas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento das Questões</CardTitle>
            <CardDescription>
              Revisão questão por questão com feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {respostas.slice(0, 10).map((resposta, index) => (
                <div key={resposta.questao_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <Badge variant={resposta.is_correct ? "default" : "destructive"}>
                          {resposta.is_correct ? 'Correta' : 'Incorreta'}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {resposta.questoes.materia} • {resposta.questoes.assunto}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {resposta.tempo_resposta}s
                      </p>
                      <p className="text-xs text-gray-500">
                        Tempo gasto
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {resposta.questoes.texto}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Sua resposta:</span>
                      <span className={`ml-2 font-medium ${
                        resposta.is_correct ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {resposta.resposta_usuario}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Resposta correta:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {resposta.resposta_correta}
                      </span>
                    </div>
                  </div>

                  {resposta.questoes.explicacao && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Explicação:</strong> {resposta.questoes.explicacao}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {respostas.length > 10 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    Mostrando 10 de {respostas.length} questões. 
                    Baixe o PDF para ver o relatório completo.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              <Award className="h-5 w-5 inline mr-2" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(performancePorMateria)
              .filter(([, stats]) => stats.percentual >= 70)
              .slice(0, 3)
              .map(([materia, stats]) => (
                <div key={materia} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">
                      Excelente em {materia}
                    </p>
                    <p className="text-xs text-green-700">
                      {stats.percentual.toFixed(1)}% de aproveitamento
                    </p>
                  </div>
                </div>
              ))}
            
            {Object.entries(performancePorMateria).filter(([, stats]) => stats.percentual >= 70).length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  Continue praticando para identificar seus pontos fortes!
                </p>
              </div>
            )}
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
            {Object.entries(performancePorMateria)
              .filter(([, stats]) => stats.percentual < 60)
              .slice(0, 3)
              .map(([materia, stats]) => (
                <div key={materia} className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Reforçar {materia}
                    </p>
                    <p className="text-xs text-red-700">
                      {stats.percentual.toFixed(1)}% de aproveitamento
                    </p>
                  </div>
                </div>
              ))}
            
            {Object.entries(performancePorMateria).filter(([, stats]) => stats.percentual < 60).length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">
                  Parabéns! Todas as matérias estão com bom aproveitamento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SimuladoRelatorioPage({ params }: SimuladoRelatorioPageProps) {
  return (
    <Suspense 
      fallback={
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      }
    >
      <SimuladoRelatorioContent id={params.id} />
    </Suspense>
  )
}