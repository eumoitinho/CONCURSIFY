'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Music,
  Settings,
  Volume2,
  Brain,
  Sparkles,
  Clock,
  Coffee,
  BookOpen,
  Save,
  RotateCcw
} from 'lucide-react'
import { updateMusicPreferences, UpdateMusicPreferencesInput } from '@/app/actions/spotify'
import { useToast } from '@/hooks/use-toast'

interface MusicPreferencesProps {
  initialPreferences?: any
}

const commonGenres = [
  'ambient', 'classical', 'lo-fi', 'jazz', 'instrumental', 
  'piano', 'electronic', 'indie', 'pop', 'chill',
  'post-rock', 'minimal', 'world', 'new-age', 'acoustic',
  'latin', 'funk', 'soul', 'reggae', 'bossa-nova'
]

const sessionSettings = {
  focus: {
    icon: Brain,
    label: 'Foco Intenso',
    color: 'text-blue-600',
    description: 'Configurações para sessões de concentração máxima'
  },
  study: {
    icon: BookOpen,
    label: 'Estudo Profundo',
    color: 'text-green-600',
    description: 'Configurações para aprendizado de novos conteúdos'
  },
  review: {
    icon: RotateCcw,
    label: 'Revisão',
    color: 'text-purple-600',
    description: 'Configurações para revisão de conteúdo'
  },
  break: {
    icon: Coffee,
    label: 'Pausa',
    color: 'text-orange-600',
    description: 'Configurações para intervalos e descanso'
  }
}

export function MusicPreferences({ initialPreferences }: MusicPreferencesProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [preferences, setPreferences] = useState<UpdateMusicPreferencesInput>({
    preferred_genres: initialPreferences?.preferred_genres || [],
    disliked_genres: initialPreferences?.disliked_genres || [],
    instrumental_only: initialPreferences?.instrumental_only || false,
    language_preference: initialPreferences?.language_preference || 'any',
    tempo_preference: initialPreferences?.tempo_preference || 'medium',
    energy_preference: initialPreferences?.energy_preference || 'medium',
    enable_ai_recommendations: initialPreferences?.enable_ai_recommendations ?? true,
    ai_learning_enabled: initialPreferences?.ai_learning_enabled ?? true,
    auto_generate_playlists: initialPreferences?.auto_generate_playlists ?? true,
    default_volume: initialPreferences?.default_volume || 50
  })

  const toggleGenre = (genre: string, isPreferred: boolean) => {
    if (isPreferred) {
      setPreferences(prev => ({
        ...prev,
        preferred_genres: prev.preferred_genres?.includes(genre)
          ? prev.preferred_genres.filter(g => g !== genre)
          : [...(prev.preferred_genres || []), genre],
        disliked_genres: prev.disliked_genres?.filter(g => g !== genre) // Remove dos não gostados
      }))
    } else {
      setPreferences(prev => ({
        ...prev,
        disliked_genres: prev.disliked_genres?.includes(genre)
          ? prev.disliked_genres.filter(g => g !== genre)
          : [...(prev.disliked_genres || []), genre],
        preferred_genres: prev.preferred_genres?.filter(g => g !== genre) // Remove dos preferidos
      }))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    
    try {
      const result = await updateMusicPreferences(preferences)
      
      if (result.success) {
        toast({
          title: 'Preferências salvas!',
          description: 'Suas configurações musicais foram atualizadas.'
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Preferências Musicais</span>
          </CardTitle>
          <CardDescription>
            Configure suas preferências para que a IA gere playlists mais personalizadas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configurações gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Idioma Preferido</Label>
              <Select 
                value={preferences.language_preference} 
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, language_preference: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer idioma</SelectItem>
                  <SelectItem value="portuguese">Português</SelectItem>
                  <SelectItem value="english">Inglês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ritmo Preferido</Label>
              <Select 
                value={preferences.tempo_preference} 
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, tempo_preference: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Lento (relaxante)</SelectItem>
                  <SelectItem value="medium">Moderado</SelectItem>
                  <SelectItem value="fast">Rápido (energético)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nível de Energia</Label>
              <Select 
                value={preferences.energy_preference} 
                onValueChange={(value: any) => setPreferences(prev => ({ ...prev, energy_preference: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa (calmo, relaxante)</SelectItem>
                  <SelectItem value="medium">Média (equilibrado)</SelectItem>
                  <SelectItem value="high">Alta (animado, motivador)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Volume Padrão: {preferences.default_volume}%</Label>
              <Slider
                value={[preferences.default_volume!]}
                onValueChange={([value]) => setPreferences(prev => ({ ...prev, default_volume: value }))}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Apenas Música Instrumental</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Priorizar músicas sem letra para melhor concentração
                </p>
              </div>
              <Switch
                checked={preferences.instrumental_only}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, instrumental_only: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gêneros musicais */}
      <Card>
        <CardHeader>
          <CardTitle>Gêneros Musicais</CardTitle>
          <CardDescription>
            Selecione os gêneros que você gosta e os que não gosta para personalizar as recomendações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-green-700 mb-3 block">
              Gêneros que você GOSTA
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonGenres.map(genre => {
                const isPreferred = preferences.preferred_genres?.includes(genre)
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre, true)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      isPreferred
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-red-700 mb-3 block">
              Gêneros que você NÃO GOSTA
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonGenres.map(genre => {
                const isDisliked = preferences.disliked_genres?.includes(genre)
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre, false)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      isDisliked
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {genre}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Dica da IA</p>
                <p className="text-blue-800 mt-1">
                  A IA também pode sugerir gêneros novos baseados no contexto de estudo, 
                  mesmo que não estejam na sua lista de preferidos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Inteligência Artificial</span>
          </CardTitle>
          <CardDescription>
            Configure como a IA deve se comportar ao gerar suas playlists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Recomendações IA Habilitadas</Label>
              <p className="text-sm text-gray-500 mt-1">
                Permite que a IA sugira músicas baseadas no contexto de estudo
              </p>
            </div>
            <Switch
              checked={preferences.enable_ai_recommendations}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, enable_ai_recommendations: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Aprendizado Automático</Label>
              <p className="text-sm text-gray-500 mt-1">
                A IA aprende com suas avaliações e comportamento para melhorar as sugestões
              </p>
            </div>
            <Switch
              checked={preferences.ai_learning_enabled}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, ai_learning_enabled: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Geração Automática</Label>
              <p className="text-sm text-gray-500 mt-1">
                Cria automaticamente playlists durante sessões Pomodoro
              </p>
            </div>
            <Switch
              checked={preferences.auto_generate_playlists}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, auto_generate_playlists: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações por tipo de sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Configurações por Tipo de Sessão</span>
          </CardTitle>
          <CardDescription>
            Personalize as preferências para cada tipo de sessão de estudo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(sessionSettings).map(([type, config]) => {
              const Icon = config.icon
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <h4 className="font-medium">{config.label}</h4>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instrumental preferido:</span>
                      <Badge variant={type !== 'break' ? 'default' : 'secondary'}>
                        {type !== 'break' ? 'Sim' : 'Opcional'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Energia recomendada:</span>
                      <Badge variant="outline">
                        {type === 'break' ? 'Alta' : type === 'review' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Personalização IA:</span>
                      <Badge variant="default">Ativa</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo das preferências */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Suas Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Gêneros preferidos:</span>
              <p className="mt-1">{preferences.preferred_genres?.length || 0} selecionados</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Idioma:</span>
              <p className="mt-1 capitalize">{preferences.language_preference}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Ritmo:</span>
              <p className="mt-1 capitalize">{preferences.tempo_preference}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">IA ativa:</span>
              <p className="mt-1">{preferences.enable_ai_recommendations ? 'Sim' : 'Não'}</p>
            </div>
          </div>

          {preferences.preferred_genres && preferences.preferred_genres.length > 0 && (
            <div>
              <span className="font-medium text-gray-600 block mb-2">Seus gêneros favoritos:</span>
              <div className="flex flex-wrap gap-1">
                {preferences.preferred_genres.slice(0, 8).map(genre => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
                {preferences.preferred_genres.length > 8 && (
                  <Badge variant="secondary" className="text-xs">
                    +{preferences.preferred_genres.length - 8} mais
                  </Badge>
                )}
              </div>
            </div>
          )}
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
              Salvar Preferências
            </>
          )}
        </Button>
      </div>
    </div>
  )
}