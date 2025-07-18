'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  Volume2,
  Bell,
  Brain,
  Clock,
  Target,
  Zap,
  Coffee,
  Save
} from 'lucide-react'
import { updateSettings } from '@/app/actions/pomodoro'
import { useToast } from '@/hooks/use-toast'

interface PomodoroSettingsProps {
  initialSettings?: any
}

export function PomodoroSettings({ initialSettings }: PomodoroSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    // Durações
    focus_duration: initialSettings?.focus_duration || 25,
    short_break_duration: initialSettings?.short_break_duration || 5,
    long_break_duration: initialSettings?.long_break_duration || 15,
    cycles_before_long_break: initialSettings?.cycles_before_long_break || 4,
    
    // IA Adaptativa
    adaptive_mode: initialSettings?.adaptive_mode ?? true,
    min_focus_duration: initialSettings?.min_focus_duration || 15,
    max_focus_duration: initialSettings?.max_focus_duration || 50,
    
    // Som e notificações
    sound_enabled: initialSettings?.sound_enabled ?? true,
    sound_type: initialSettings?.sound_type || 'bell',
    sound_volume: initialSettings?.sound_volume || 70,
    vibration_enabled: initialSettings?.vibration_enabled ?? true,
    desktop_notifications: initialSettings?.desktop_notifications ?? true,
    
    // Automação
    auto_start_breaks: initialSettings?.auto_start_breaks || false,
    auto_start_focus: initialSettings?.auto_start_focus || false,
    enforce_breaks: initialSettings?.enforce_breaks ?? true,
    
    // Tracking
    track_productivity: initialSettings?.track_productivity ?? true,
    track_mood: initialSettings?.track_mood ?? true,
    track_energy: initialSettings?.track_energy ?? true,
    
    // Metas
    daily_goal_sessions: initialSettings?.daily_goal_sessions || 8,
    weekly_goal_hours: initialSettings?.weekly_goal_hours || 25,
    
    // Integração
    auto_create_study_notes: initialSettings?.auto_create_study_notes ?? true,
    sync_with_calendar: initialSettings?.sync_with_calendar || false,
    share_stats: initialSettings?.share_stats || false
  })

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      const result = await updateSettings(settings)
      
      if (result.success) {
        toast({
          title: 'Configurações salvas!',
          description: 'Suas preferências foram atualizadas com sucesso.'
        })
      } else {
        toast({
          title: 'Erro ao salvar',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast({
          title: 'Notificações ativadas!',
          description: 'Você receberá alertas quando as sessões terminarem.'
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Durações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Durações Padrão</span>
          </CardTitle>
          <CardDescription>
            Configure os tempos padrão para cada tipo de sessão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Sessão de Foco (minutos): {settings.focus_duration}</Label>
              <Slider
                value={[settings.focus_duration]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, focus_duration: value }))}
                max={120}
                min={10}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Pausa Curta (minutos): {settings.short_break_duration}</Label>
              <Slider
                value={[settings.short_break_duration]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, short_break_duration: value }))}
                max={30}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Pausa Longa (minutos): {settings.long_break_duration}</Label>
              <Slider
                value={[settings.long_break_duration]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, long_break_duration: value }))}
                max={60}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Ciclos até pausa longa: {settings.cycles_before_long_break}</Label>
              <Slider
                value={[settings.cycles_before_long_break]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, cycles_before_long_break: value }))}
                max={10}
                min={2}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IA Adaptativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>IA Adaptativa</span>
          </CardTitle>
          <CardDescription>
            A IA aprende com seus hábitos e sugere durações otimizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Modo Adaptativo</Label>
              <p className="text-sm text-gray-500">
                Permite que a IA ajuste automaticamente as durações das sessões
              </p>
            </div>
            <Switch
              checked={settings.adaptive_mode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, adaptive_mode: checked }))}
            />
          </div>

          {settings.adaptive_mode && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Duração mínima (minutos): {settings.min_focus_duration}</Label>
                <Slider
                  value={[settings.min_focus_duration]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, min_focus_duration: value }))}
                  max={settings.max_focus_duration - 5}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Duração máxima (minutos): {settings.max_focus_duration}</Label>
                <Slider
                  value={[settings.max_focus_duration]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, max_focus_duration: value }))}
                  max={120}
                  min={settings.min_focus_duration + 5}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Som e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5" />
            <span>Som e Notificações</span>
          </CardTitle>
          <CardDescription>
            Configure alertas sonoros e notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Som Habilitado</Label>
              <p className="text-sm text-gray-500">
                Toca um som quando a sessão termina
              </p>
            </div>
            <Switch
              checked={settings.sound_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sound_enabled: checked }))}
            />
          </div>

          {settings.sound_enabled && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Tipo de Som</Label>
                <Select 
                  value={settings.sound_type} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sound_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bell">Sino</SelectItem>
                    <SelectItem value="chime">Carrilhão</SelectItem>
                    <SelectItem value="ding">Ding</SelectItem>
                    <SelectItem value="notification">Notificação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Volume: {settings.sound_volume}%</Label>
                <Slider
                  value={[settings.sound_volume]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, sound_volume: value }))}
                  max={100}
                  min={0}
                  step={10}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Notificações Desktop</Label>
              <p className="text-sm text-gray-500">
                Exibe notificações na área de trabalho
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.desktop_notifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, desktop_notifications: checked }))}
              />
              {settings.desktop_notifications && (
                <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
                  <Bell className="h-4 w-4 mr-1" />
                  Testar
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Vibração (Mobile)</Label>
              <p className="text-sm text-gray-500">
                Vibra o dispositivo quando possível
              </p>
            </div>
            <Switch
              checked={settings.vibration_enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, vibration_enabled: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Automação</span>
          </CardTitle>
          <CardDescription>
            Configure comportamentos automáticos do timer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Iniciar Pausas Automaticamente</Label>
              <p className="text-sm text-gray-500">
                Inicia pausas automaticamente após sessões de foco
              </p>
            </div>
            <Switch
              checked={settings.auto_start_breaks}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_start_breaks: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Iniciar Foco Automaticamente</Label>
              <p className="text-sm text-gray-500">
                Inicia sessões de foco automaticamente após pausas
              </p>
            </div>
            <Switch
              checked={settings.auto_start_focus}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_start_focus: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Forçar Pausas</Label>
              <p className="text-sm text-gray-500">
                Impede sessões consecutivas sem pausas
              </p>
            </div>
            <Switch
              checked={settings.enforce_breaks}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enforce_breaks: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Metas</span>
          </CardTitle>
          <CardDescription>
            Defina suas metas de produtividade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Meta diária de sessões: {settings.daily_goal_sessions}</Label>
              <Slider
                value={[settings.daily_goal_sessions]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, daily_goal_sessions: value }))}
                max={20}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>Meta semanal (horas): {settings.weekly_goal_hours}</Label>
              <Slider
                value={[settings.weekly_goal_hours]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, weekly_goal_hours: value }))}
                max={100}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Tracking</CardTitle>
          <CardDescription>
            Configure quais dados são coletados para melhorar as recomendações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Acompanhar Produtividade</Label>
              <p className="text-sm text-gray-500">
                Solicita avaliação da produtividade ao final das sessões
              </p>
            </div>
            <Switch
              checked={settings.track_productivity}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, track_productivity: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Acompanhar Humor</Label>
              <p className="text-sm text-gray-500">
                Registra como você se sente antes e depois das sessões
              </p>
            </div>
            <Switch
              checked={settings.track_mood}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, track_mood: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Acompanhar Energia</Label>
              <p className="text-sm text-gray-500">
                Monitora níveis de energia para otimizar horários de estudo
              </p>
            </div>
            <Switch
              checked={settings.track_energy}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, track_energy: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>
            Configure integrações com outros módulos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Criar Notas Automaticamente</Label>
              <p className="text-sm text-gray-500">
                Cria notas no Caderno automaticamente ao estudar
              </p>
            </div>
            <Switch
              checked={settings.auto_create_study_notes}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_create_study_notes: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Sincronizar com Calendário</Label>
              <p className="text-sm text-gray-500">
                Adiciona sessões ao seu calendário pessoal
              </p>
            </div>
            <Switch
              checked={settings.sync_with_calendar}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sync_with_calendar: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Compartilhar Estatísticas</Label>
              <p className="text-sm text-gray-500">
                Permite compartilhar progresso anonimizado para melhorias
              </p>
            </div>
            <Switch
              checked={settings.share_stats}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, share_stats: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}