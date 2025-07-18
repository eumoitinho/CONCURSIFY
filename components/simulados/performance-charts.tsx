'use client'

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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

interface PerformanceChartsProps {
  data: {
    performancePorMateria?: Record<string, { acertos: number; total: number; percentual: number }>
    evolucaoTemporal?: Array<{ periodo: string; pontuacao: number; data: string }>
    distribuicaoDificuldade?: Array<{ nivel: string; acertos: number; total: number; percentual: number }>
    temposPorQuestao?: Array<{ questao: number; tempo: number; materia: string }>
    comparacaoMetas?: Array<{ materia: string; atual: number; meta: number }>
  }
  className?: string
}

export function PerformanceCharts({ data, className }: PerformanceChartsProps) {
  // Preparar dados para gráficos
  const performanceData = data.performancePorMateria 
    ? Object.entries(data.performancePorMateria).map(([materia, stats]) => ({
        materia: materia.length > 15 ? `${materia.substring(0, 15)}...` : materia,
        percentual: stats.percentual,
        acertos: stats.acertos,
        total: stats.total,
        color: stats.percentual >= 70 ? '#10b981' : stats.percentual >= 50 ? '#f59e0b' : '#ef4444'
      }))
    : []

  const dificuldadeData = data.distribuicaoDificuldade || [
    { nivel: 'Fácil', acertos: 8, total: 10, percentual: 80, color: '#10b981' },
    { nivel: 'Médio', acertos: 12, total: 20, percentual: 60, color: '#f59e0b' },
    { nivel: 'Difícil', acertos: 3, total: 10, percentual: 30, color: '#ef4444' }
  ]

  const evolucaoData = data.evolucaoTemporal || [
    { periodo: 'Sem 1', pontuacao: 45, data: '2024-01-01' },
    { periodo: 'Sem 2', pontuacao: 52, data: '2024-01-08' },
    { periodo: 'Sem 3', pontuacao: 61, data: '2024-01-15' },
    { periodo: 'Sem 4', pontuacao: 68, data: '2024-01-22' }
  ]

  const radarData = performanceData.slice(0, 6).map(item => ({
    materia: item.materia,
    atual: item.percentual,
    meta: 75
  }))

  const temposData = data.temposPorQuestao?.slice(0, 20) || []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance por Matéria - Gráfico de Barras */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance por Matéria
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="materia" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
              stroke="#64748b"
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, 'Aproveitamento']}
              labelFormatter={(label) => `Matéria: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="percentual" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Temporal */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução da Performance
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={evolucaoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="periodo" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Pontuação']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
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
        </div>

        {/* Distribuição por Dificuldade */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance por Dificuldade
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dificuldadeData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="percentual"
                label={({ nivel, percentual }) => `${nivel}: ${percentual}%`}
                labelLine={false}
              >
                {dificuldadeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Aproveitamento']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico Radar - Comparação com Metas */}
      {radarData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance vs Metas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis 
                dataKey="materia" 
                fontSize={12}
                className="text-gray-600"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                fontSize={10}
                className="text-gray-400"
              />
              <Radar
                name="Atual"
                dataKey="atual"
                stroke="#3b82f6"
                fill="#3b82f630"
                strokeWidth={2}
              />
              <Radar
                name="Meta"
                dataKey="meta"
                stroke="#10b981"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Performance Atual</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Meta (75%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tempo por Questão */}
      {temposData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tempo por Questão (últimas 20)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={temposData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="questao" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                label={{ value: 'Tempo (s)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}s`, 'Tempo']}
                labelFormatter={(label) => `Questão ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="tempo" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6, fill: '#f59e0b' }}
              />
              {/* Linha de referência para tempo ideal (150s) */}
              <Line 
                type="monotone" 
                dataKey={() => 150} 
                stroke="#ef4444" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Tempo Real</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-0.5 bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Tempo Ideal (2.5min)</span>
            </div>
          </div>
        </div>
      )}

      {/* Análise Comparativa - Barras Horizontais */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Matérias
        </h3>
        <div className="space-y-3">
          {performanceData
            .sort((a, b) => b.percentual - a.percentual)
            .slice(0, 8)
            .map((item, index) => (
              <div key={item.materia} className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {item.materia}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {item.percentual.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percentual}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.acertos}/{item.total} questões corretas
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}