'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Sparkles, 
  Music, 
  Brain, 
  Coffee, 
  BookOpen, 
  RotateCcw, 
  Lightbulb,
  Zap,
  Clock,
  Volume2,
  Check,
  ExternalLink
} from 'lucide-react'
import { generatePlaylist, GeneratePlaylistInput } from '@/app/actions/spotify'
import { useToast } from '@/hooks/use-toast'

interface PlaylistGeneratorProps {
  preferences?: any
}

const sessionTypeConfig = {
  focus: {
    icon: Brain,
    label: 'Foco Intenso',
    description: 'Concentração máxima em uma tarefa específica',
    defaultDuration: 25,
    color: 'bg-[#FF723A]',
    suggestions: 'Música instrumental, ambient, minimal com BPM baixo'
  },
  study: {
    icon: BookOpen,
    label: 'Estudo Profundo',
    description: 'Aprendizado de novos conceitos e conteúdos',
    defaultDuration: 45,
    color: 'bg-[#E55A2B]',
    suggestions: 'Classical, lo-fi, jazz instrumental sem letra'
  },
  review: {
    icon: RotateCcw,
    label: 'Revisão Ativa',
    description: 'Revisão de conteúdo já aprendido',
    defaultDuration: 20,
    color: 'bg-[#FFB08A]',
    suggestions: 'Música ligeiramente mais energética, uptempo instrumental'
  },
  break: {
    icon: Coffee,
    label: 'Pausa Energizante',
    description: 'Descanso e renovação de energia',
    defaultDuration: 5,
    color: 'bg-orange-500',
    suggestions: 'Música alegre, pop, indie, qualquer gênero animado'
  }
}

const commonGenres = [
  'ambient', 'classical', 'lo-fi', 'jazz', 'instrumental', 
  'piano', 'electronic', 'indie', 'pop', 'chill',
  'post-rock', 'minimal', 'world', 'new-age', 'acoustic'
]

export function PlaylistGenerator({ preferences }: PlaylistGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [generatedPlaylist, setGeneratedPlaylist] = useState<any>(null)
  
  const [formData, setFormData] = useState<GeneratePlaylistInput>({
    subject: '',
    sessionType: 'focus',
    duration: 25,
    mood: '',
    energy: 7,
    preferences: {
      genres: preferences?.preferred_genres || [],
      instrumental: preferences?.instrumental_only || false,
      language: preferences?.language_preference || 'any',
      tempo: preferences?.tempo_preference || 'medium'
    }
  })

  const handleSessionTypeChange = (type: GeneratePlaylistInput['sessionType']) => {
    const config = sessionTypeConfig[type]
    setFormData(prev => ({
      ...prev,
      sessionType: type,
      duration: config.defaultDuration
    }))
  }

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        genres: prev.preferences?.genres?.includes(genre)
          ? prev.preferences.genres.filter(g => g !== genre)
          : [...(prev.preferences?.genres || []), genre]
      }
    }))
  }

  const handleGenerate = async () => {
    if (!formData.subject.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe a matéria ou assunto',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)

    try {
      const result = await generatePlaylist(formData)
      
      if (result.success) {
        setGeneratedPlaylist(result.data)
        setShowResult(true)
        toast({
          title: 'Playlist gerada!',
          description: `"${result.data.name}" foi criada com ${result.data.tracks.length} músicas`
        })
      } else {
        toast({
          title: 'Erro ao gerar playlist',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedSessionType = sessionTypeConfig[formData.sessionType]
  const SessionIcon = selectedSessionType.icon

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-[#E55A2B]" />
            <span>Gerador de Playlist com IA</span>
          </CardTitle>
          <CardDescription>
            Crie playlists personalizadas baseadas no seu contexto de estudo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de sessão */}
          <div>
            <Label className="text-base font-medium">Tipo de Sessão</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {Object.entries(sessionTypeConfig).map(([type, config]) => {
                const Icon = config.icon
                const isSelected = formData.sessionType === type
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSessionTypeChange(type as any)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isSelected 
                        ? 'border-[#FF723A] bg-[#FFB08A]/20 text-[#E55A2B]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${config.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{config.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{config.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* Sugestão para o tipo selecionado */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <span className="font-medium">Recomendação IA:</span>
                  <span className="text-gray-600 ml-1">{selectedSessionType.suggestions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matéria/Assunto */}
          <div>
            <Label htmlFor="subject">Matéria ou Assunto *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Ex: Matemática, Português, História, Programação..."
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              A IA usará isso para personalizar o estilo musical
            </p>
          </div>

          {/* Duração */}
          <div>
            <Label>Duração: {formData.duration} minutos</Label>
            <Slider
              value={[formData.duration]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, duration: value }))}
              max={180}
              min={5}
              step={5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>3 horas</span>
            </div>
          </div>

          {/* Estado atual */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mood">Humor Atual (opcional)</Label>
              <Input
                id="mood"
                value={formData.mood}
                onChange={(e) => setFormData(prev => ({ ...prev, mood: e.target.value }))}
                placeholder="Ex: focado, cansado, motivado..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Nível de Energia: {formData.energy}/10</Label>
              <Slider
                value={[formData.energy!]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, energy: value }))}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          {/* Preferências musicais */}
          <div>
            <Label className="text-base font-medium">Preferências Musicais</Label>
            
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <Label className="text-sm">Idioma</Label>
                <Select 
                  value={formData.preferences?.language} 
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, language: value }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    <SelectItem value="portuguese">Português</SelectItem>
                    <SelectItem value="english">Inglês</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Ritmo</Label>
                <Select 
                  value={formData.preferences?.tempo} 
                  onValueChange={(value: any) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, tempo: value }
                  }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Lento</SelectItem>
                    <SelectItem value="medium">Moderado</SelectItem>
                    <SelectItem value="fast">Rápido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="instrumental"
                  checked={formData.preferences?.instrumental}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, instrumental: checked as boolean }
                  }))}
                />
                <Label htmlFor="instrumental" className="text-sm">
                  Apenas instrumental
                </Label>
              </div>
            </div>

            {/* Gêneros preferidos */}
            <div className="mt-4">
              <Label className="text-sm">Gêneros Preferidos (opcional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonGenres.map(genre => {
                  const isSelected = formData.preferences?.genres?.includes(genre)
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        isSelected
                          ? 'bg-[#FF723A] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                A IA usará estes como referência, mas pode sugerir outros gêneros adequados
              </p>
            </div>
          </div>

          {/* Botão de geração */}
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !formData.subject.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Gerando com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Gerar Playlist Personalizada
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de resultado */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Playlist Criada com Sucesso!</span>
            </DialogTitle>
            <DialogDescription>
              Sua playlist personalizada está pronta para usar
            </DialogDescription>
          </DialogHeader>
          
          {generatedPlaylist && (
            <div className="space-y-6">
              {/* Info da playlist */}
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Music className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{generatedPlaylist.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{generatedPlaylist.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{generatedPlaylist.tracks.length} músicas</span>
                    <span>~{Math.round(generatedPlaylist.tracks.reduce((acc: number, track: any) => acc + track.duration_ms, 0) / 60000)} min</span>
                  </div>
                </div>
              </div>

              {/* Rationale da IA */}
              <div className="p-4 bg-[#FFB08A]/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Brain className="h-4 w-4 text-[#FF723A] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-[#E55A2B] text-sm">Análise da IA</h4>
                    <p className="text-[#E55A2B]/80 text-sm mt-1">{generatedPlaylist.rationale}</p>
                  </div>
                </div>
              </div>

              {/* Características */}
              <div>
                <h4 className="font-medium mb-3">Características da Playlist</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo médio:</span>
                    <span className="font-medium">{generatedPlaylist.characteristics.avgTempo} BPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Energia:</span>
                    <span className="font-medium">{Math.round(generatedPlaylist.characteristics.avgEnergy * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Positividade:</span>
                    <span className="font-medium">{Math.round(generatedPlaylist.characteristics.avgValence * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gêneros:</span>
                    <span className="font-medium">{generatedPlaylist.characteristics.mainGenres.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Preview das primeiras músicas */}
              <div>
                <h4 className="font-medium mb-3">Primeiras Músicas</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generatedPlaylist.tracks.slice(0, 6).map((track: any, index: number) => (
                    <div key={track.id} className="flex items-center space-x-3 text-sm">
                      <span className="text-gray-400 w-6">{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-gray-500 truncate">{track.artists[0]?.name}</p>
                      </div>
                      <span className="text-gray-400">
                        {Math.round(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                  {generatedPlaylist.tracks.length > 6 && (
                    <p className="text-gray-500 text-xs text-center py-2">
                      +{generatedPlaylist.tracks.length - 6} músicas adicionais
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-3">
                <Button asChild className="flex-1">
                  <a href={generatedPlaylist.spotify_url} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir no Spotify
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setShowResult(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}