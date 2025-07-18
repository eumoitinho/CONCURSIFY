'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Coffee,
  Brain,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { startSession, updateSession, addInterruption } from '@/app/actions/pomodoro'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface PomodoroTimerProps {
  activeSession: any
  settings: any
}

interface TimerState {
  timeLeft: number
  isRunning: boolean
  isPaused: boolean
  currentPhase: 'focus' | 'short_break' | 'long_break'
  completedCycles: number
}

export function PomodoroTimer({ activeSession, settings }: PomodoroTimerProps) {
  const { toast } = useToast()
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: (settings?.focus_duration || 25) * 60,
    isRunning: false,
    isPaused: false,
    currentPhase: 'focus',
    completedCycles: 0
  })
  
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showInterruptionDialog, setShowInterruptionDialog] = useState(false)
  const [completionData, setCompletionData] = useState({
    productivity_score: 7,
    focus_score: 7,
    energy_level_end: 7,
    session_notes: '',
    achievements: [] as string[],
    challenges: [] as string[]
  })
  const [interruptionData, setInterruptionData] = useState({
    type: 'external' as const,
    description: '',
    duration: 30,
    impact: 3
  })

  // Calcular tempo total da sessão
  const totalTime = activeSession?.planned_duration 
    ? activeSession.planned_duration * 60 
    : (settings?.focus_duration || 25) * 60

  // Atualizar estado do timer baseado na sessão ativa
  useEffect(() => {
    if (activeSession) {
      const sessionStart = new Date(activeSession.actual_start)
      const now = new Date()
      const elapsedSeconds = Math.floor((now.getTime() - sessionStart.getTime()) / 1000)
      const remainingTime = Math.max(0, totalTime - elapsedSeconds)
      
      setTimerState(prev => ({
        ...prev,
        timeLeft: remainingTime,
        isRunning: activeSession.status === 'in_progress',
        isPaused: activeSession.status === 'paused'
      }))
      setStartTime(sessionStart)
    }
  }, [activeSession, totalTime])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }))
      }, 1000)
    } else if (timerState.timeLeft === 0 && timerState.isRunning) {
      // Timer finished
      handleTimerComplete()
    }

    return () => clearInterval(interval)
  }, [timerState.isRunning, timerState.timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    if (!activeSession) {
      toast({
        title: 'Nenhuma sessão ativa',
        description: 'Crie uma nova sessão primeiro',
        variant: 'destructive'
      })
      return
    }

    try {
      const result = await startSession(activeSession.id)
      if (result.success) {
        setTimerState(prev => ({ ...prev, isRunning: true, isPaused: false }))
        setStartTime(new Date())
        toast({
          title: 'Sessão iniciada!',
          description: 'Boa sorte com seus estudos!'
        })
      } else {
        toast({
          title: 'Erro ao iniciar sessão',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente',
        variant: 'destructive'
      })
    }
  }

  const handlePause = async () => {
    if (!activeSession) return

    try {
      const result = await updateSession({
        id: activeSession.id,
        status: 'paused'
      })
      
      if (result.success) {
        setTimerState(prev => ({ ...prev, isRunning: false, isPaused: true }))
        toast({
          title: 'Sessão pausada',
          description: 'Volte quando estiver pronto!'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao pausar',
        variant: 'destructive'
      })
    }
  }

  const handleStop = async () => {
    if (!activeSession) return
    setShowCompleteDialog(true)
  }

  const handleTimerComplete = () => {
    // Som de notificação
    if (settings?.sound_enabled) {
      // Implementar som
    }
    
    // Notificação desktop
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Concluído!', {
        body: 'Tempo de fazer uma pausa',
        icon: '/favicon.ico'
      })
    }

    setTimerState(prev => ({ ...prev, isRunning: false }))
    setShowCompleteDialog(true)
  }

  const handleCompleteSession = async () => {
    if (!activeSession || !startTime) return

    const actualDuration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60)
    const completionPercentage = Math.min(100, (actualDuration / activeSession.planned_duration) * 100)

    try {
      const result = await updateSession({
        id: activeSession.id,
        status: 'completed',
        actual_duration: actualDuration,
        completion_percentage: completionPercentage,
        productivity_score: completionData.productivity_score,
        focus_score: completionData.focus_score,
        energy_level_end: completionData.energy_level_end,
        session_notes: completionData.session_notes,
        achievements: completionData.achievements,
        challenges: completionData.challenges
      })

      if (result.success) {
        setShowCompleteDialog(false)
        toast({
          title: 'Sessão concluída!',
          description: 'Parabéns! Sessão registrada com sucesso.'
        })
        
        // Reset timer
        setTimerState(prev => ({
          ...prev,
          timeLeft: totalTime,
          isRunning: false,
          isPaused: false
        }))
        
        // Reload page to update data
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: 'Erro ao finalizar sessão',
        variant: 'destructive'
      })
    }
  }

  const handleAddInterruption = async () => {
    if (!activeSession) return

    try {
      const result = await addInterruption({
        session_id: activeSession.id,
        interruption_type: interruptionData.type,
        description: interruptionData.description,
        duration_seconds: interruptionData.duration,
        impact_level: interruptionData.impact
      })

      if (result.success) {
        setShowInterruptionDialog(false)
        toast({
          title: 'Interrupção registrada',
          description: 'Continue com foco!'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro ao registrar interrupção',
        variant: 'destructive'
      })
    }
  }

  const progress = totalTime > 0 ? ((totalTime - timerState.timeLeft) / totalTime) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Timer principal */}
      <div className="text-center space-y-4">
        <div className={cn(
          "text-6xl font-mono font-bold transition-colors duration-300",
          timerState.timeLeft < 60 ? "text-red-500" : "text-gray-900"
        )}>
          {formatTime(timerState.timeLeft)}
        </div>
        
        <Progress value={progress} className="h-3" />
        
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>
            {Math.floor(progress)}% concluído • {Math.floor((totalTime - timerState.timeLeft) / 60)} de {Math.floor(totalTime / 60)} min
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center space-x-4">
        {!timerState.isRunning && !timerState.isPaused && (
          <Button onClick={handleStart} size="lg" className="px-8">
            <Play className="h-5 w-5 mr-2" />
            Iniciar
          </Button>
        )}
        
        {timerState.isRunning && (
          <>
            <Button onClick={handlePause} variant="outline" size="lg" className="px-8">
              <Pause className="h-5 w-5 mr-2" />
              Pausar
            </Button>
            <Button onClick={handleStop} variant="outline" size="lg" className="px-8">
              <Square className="h-5 w-5 mr-2" />
              Finalizar
            </Button>
          </>
        )}
        
        {timerState.isPaused && (
          <>
            <Button onClick={handleStart} size="lg" className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Continuar
            </Button>
            <Button onClick={handleStop} variant="outline" size="lg" className="px-8">
              <Square className="h-5 w-5 mr-2" />
              Finalizar
            </Button>
          </>
        )}

        {/* Registrar interrupção */}
        {timerState.isRunning && (
          <Dialog open={showInterruptionDialog} onOpenChange={setShowInterruptionDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Interrupção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Interrupção</DialogTitle>
                <DialogDescription>
                  Documente o que interrompeu sua sessão
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Tipo de interrupção</Label>
                  <Select 
                    value={interruptionData.type} 
                    onValueChange={(value: any) => setInterruptionData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">Externa (telefone, pessoa)</SelectItem>
                      <SelectItem value="internal">Interna (pensamento, fome)</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="distraction">Distração</SelectItem>
                      <SelectItem value="technical">Problema técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Descrição (opcional)</Label>
                  <Textarea
                    value={interruptionData.description}
                    onChange={(e) => setInterruptionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="O que aconteceu?"
                  />
                </div>

                <div>
                  <Label>Duração da interrupção (segundos)</Label>
                  <Input
                    type="number"
                    value={interruptionData.duration}
                    onChange={(e) => setInterruptionData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div>
                  <Label>Impacto no foco (1-5): {interruptionData.impact}</Label>
                  <Slider
                    value={[interruptionData.impact]}
                    onValueChange={([value]) => setInterruptionData(prev => ({ ...prev, impact: value }))}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInterruptionDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddInterruption}>
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Status da sessão */}
      {activeSession && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {activeSession.session_type}
                  </Badge>
                  <span className="text-sm font-medium">
                    {activeSession.task_description || 'Sessão de estudo'}
                  </span>
                </div>
                {activeSession.subject && (
                  <p className="text-sm text-gray-500">
                    Matéria: {activeSession.subject}
                  </p>
                )}
              </div>
              
              <div className="text-right text-sm text-gray-500">
                <div>Meta: {activeSession.planned_duration} min</div>
                <div>Energia: {activeSession.energy_level}/10</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de conclusão */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar Sessão</DialogTitle>
            <DialogDescription>
              Como foi sua sessão? Suas avaliações ajudam a melhorar futuras recomendações.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Produtividade (1-10): {completionData.productivity_score}</Label>
                <Slider
                  value={[completionData.productivity_score]}
                  onValueChange={([value]) => setCompletionData(prev => ({ ...prev, productivity_score: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Foco (1-10): {completionData.focus_score}</Label>
                <Slider
                  value={[completionData.focus_score]}
                  onValueChange={([value]) => setCompletionData(prev => ({ ...prev, focus_score: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Energia final (1-10): {completionData.energy_level_end}</Label>
                <Slider
                  value={[completionData.energy_level_end]}
                  onValueChange={([value]) => setCompletionData(prev => ({ ...prev, energy_level_end: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Notas da sessão (opcional)</Label>
              <Textarea
                value={completionData.session_notes}
                onChange={(e) => setCompletionData(prev => ({ ...prev, session_notes: e.target.value }))}
                placeholder="O que você aprendeu? Como se sentiu?"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Conquistas desta sessão</Label>
                <Textarea
                  value={completionData.achievements.join('\n')}
                  onChange={(e) => setCompletionData(prev => ({ 
                    ...prev, 
                    achievements: e.target.value.split('\n').filter(a => a.trim()) 
                  }))}
                  placeholder="Uma conquista por linha..."
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Desafios enfrentados</Label>
                <Textarea
                  value={completionData.challenges.join('\n')}
                  onChange={(e) => setCompletionData(prev => ({ 
                    ...prev, 
                    challenges: e.target.value.split('\n').filter(c => c.trim()) 
                  }))}
                  placeholder="Um desafio por linha..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCompleteSession}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}