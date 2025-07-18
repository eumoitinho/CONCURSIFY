'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { 
  Brain, 
  Coffee, 
  BookOpen, 
  RotateCcw, 
  Lightbulb, 
  Zap,
  Plus,
  Sparkles
} from 'lucide-react'
import { createSession, getAdaptiveRecommendation } from '@/app/actions/pomodoro'
import { useToast } from '@/hooks/use-toast'

interface SessionCreateFormProps {
  settings: any
}

interface SessionFormData {
  session_type: 'focus' | 'short_break' | 'long_break' | 'study' | 'review'
  planned_duration: number
  note_id?: string
  subject: string
  task_description: string
  goals: string[]
  energy_level: number
  environment: string
  background_noise: string
}

const sessionTypeConfig = {
  focus: {
    icon: Brain,
    label: 'Foco Intenso',
    description: 'Concentração máxima em uma tarefa',
    defaultDuration: 25,
    color: 'bg-blue-500'
  },
  study: {
    icon: BookOpen,
    label: 'Estudo Profundo',
    description: 'Aprendizado de novos conceitos',
    defaultDuration: 45,
    color: 'bg-green-500'
  },
  review: {
    icon: RotateCcw,
    label: 'Revisão',
    description: 'Revisão de conteúdo aprendido',
    defaultDuration: 20,
    color: 'bg-purple-500'
  },
  short_break: {
    icon: Coffee,
    label: 'Pausa Curta',
    description: 'Descanso rápido e revigorante',
    defaultDuration: 5,
    color: 'bg-orange-500'
  },
  long_break: {
    icon: Coffee,
    label: 'Pausa Longa',
    description: 'Descanso prolongado',
    defaultDuration: 15,
    color: 'bg-red-500'
  }
}

export function SessionCreateForm({ settings }: SessionCreateFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showAdaptive, setShowAdaptive] = useState(false)
  const [adaptiveRecommendation, setAdaptiveRecommendation] = useState<any>(null)
  
  const [formData, setFormData] = useState<SessionFormData>({
    session_type: 'focus',
    planned_duration: settings?.focus_duration || 25,
    subject: '',
    task_description: '',
    goals: [],
    energy_level: 7,
    environment: 'casa',
    background_noise: 'silent'
  })

  const [goalInput, setGoalInput] = useState('')

  const handleSessionTypeChange = (type: SessionFormData['session_type']) => {
    const config = sessionTypeConfig[type]
    setFormData(prev => ({
      ...prev,
      session_type: type,
      planned_duration: config.defaultDuration
    }))
  }

  const addGoal = () => {
    if (goalInput.trim() && formData.goals.length < 5) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, goalInput.trim()]
      }))
      setGoalInput('')
    }
  }

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }))
  }

  const getAdaptiveRecommendations = async () => {
    setIsLoading(true)
    setShowAdaptive(true)

    try {
      const result = await getAdaptiveRecommendation({
        currentTime: new Date(),
        subject: formData.subject,
        sessionType: formData.session_type as any,
        userEnergyLevel: formData.energy_level,
        environmentNoise: formData.background_noise as any,
        difficulty: 'medium' // Poderia ser determinado pelo subject
      })

      if (result.success) {
        setAdaptiveRecommendation(result.data)
        
        // Aplicar recomendação automaticamente
        setFormData(prev => ({
          ...prev,
          planned_duration: result.data.recommendedDuration
        }))

        toast({
          title: 'Recomendação IA gerada!',
          description: result.data.reasoning
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao gerar recomendação',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createSession(formData)
      
      if (result.success) {
        toast({
          title: 'Sessão criada!',
          description: 'Sua nova sessão está pronta para começar.'
        })
        
        // Reset form
        setFormData({
          session_type: 'focus',
          planned_duration: settings?.focus_duration || 25,
          subject: '',
          task_description: '',
          goals: [],
          energy_level: 7,
          environment: 'casa',
          background_noise: 'silent'
        })
        
        // Reload page to show new session
        window.location.reload()
      } else {
        toast({
          title: 'Erro ao criar sessão',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de sessão */}
        <div>
          <Label className="text-base font-medium">Tipo de Sessão</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(sessionTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              const isSelected = formData.session_type === type
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSessionTypeChange(type as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-900' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${config.color} text-white`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-gray-500">{config.defaultDuration}min</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Duração com IA */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Duração (minutos): {formData.planned_duration}</Label>
            {settings?.adaptive_mode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getAdaptiveRecommendations}
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                IA
              </Button>
            )}
          </div>
          
          <Slider
            value={[formData.planned_duration]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, planned_duration: value }))}
            max={120}
            min={5}
            step={5}
          />

          {showAdaptive && adaptiveRecommendation && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Recomendação IA</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {adaptiveRecommendation.reasoning}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">
                        Confiança: {Math.round(adaptiveRecommendation.confidence * 100)}%
                      </Badge>
                      <Badge variant="outline">
                        {adaptiveRecommendation.recommendedDuration} min
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Matéria/Assunto */}
        <div>
          <Label htmlFor="subject">Matéria/Assunto</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Ex: Matemática, Português, Programação..."
          />
        </div>

        {/* Descrição da tarefa */}
        <div>
          <Label htmlFor="task">Descrição da Tarefa</Label>
          <Textarea
            id="task"
            value={formData.task_description}
            onChange={(e) => setFormData(prev => ({ ...prev, task_description: e.target.value }))}
            placeholder="O que você vai fazer nesta sessão?"
            rows={3}
          />
        </div>

        {/* Objetivos */}
        <div>
          <Label>Objetivos da Sessão</Label>
          <div className="flex space-x-2 mt-1">
            <Input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Adicionar objetivo..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
            />
            <Button type="button" onClick={addGoal} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.goals.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.goals.map((goal, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeGoal(index)}
                >
                  {goal} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Nível de energia */}
        <div>
          <Label>Nível de Energia (1-10): {formData.energy_level}</Label>
          <Slider
            value={[formData.energy_level]}
            onValueChange={([value]) => setFormData(prev => ({ ...prev, energy_level: value }))}
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Muito cansado</span>
            <span>Energizado</span>
          </div>
        </div>

        {/* Ambiente */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ambiente</Label>
            <Select value={formData.environment} onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="biblioteca">Biblioteca</SelectItem>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="cafeteria">Cafeteria</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ruído de Fundo</Label>
            <Select value={formData.background_noise} onValueChange={(value) => setFormData(prev => ({ ...prev, background_noise: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="silent">Silencioso</SelectItem>
                <SelectItem value="ambient">Ruído ambiente</SelectItem>
                <SelectItem value="music">Música</SelectItem>
                <SelectItem value="busy">Barulhento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão de submit */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" />
              Criando Sessão...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Criar Sessão
            </>
          )}
        </Button>
      </form>
    </div>
  )
}