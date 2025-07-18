'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Music,
  Play,
  Heart,
  Star,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  TrendingUp,
  Eye,
  Volume2
} from 'lucide-react'
import { ratePlaylist, playPlaylist } from '@/app/actions/spotify'
import { useToast } from '@/hooks/use-toast'

interface PlaylistLibraryProps {
  playlists: any[]
}

const sessionTypeConfig = {
  focus: { label: 'Foco', color: 'bg-[#FF723A]' },
  study: { label: 'Estudo', color: 'bg-[#E55A2B]' },
  review: { label: 'Revisão', color: 'bg-[#FFB08A]' },
  break: { label: 'Pausa', color: 'bg-orange-500' }
}

export function PlaylistLibrary({ playlists }: PlaylistLibraryProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null)

  // Filtrar playlists
  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = !searchTerm || 
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || playlist.session_type === selectedType
    const matchesSubject = !selectedSubject || playlist.subject === selectedSubject
    
    return matchesSearch && matchesType && matchesSubject
  })

  // Obter valores únicos para filtros
  const uniqueSubjects = Array.from(new Set(playlists.map(p => p.subject)))

  const handlePlay = async (playlistId: string) => {
    try {
      const result = await playPlaylist(playlistId)
      if (result.success) {
        toast({
          title: 'Reprodução iniciada',
          description: result.message
        })
      } else {
        toast({
          title: 'Erro na reprodução',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        variant: 'destructive'
      })
    }
  }

  const handleRate = async (playlistId: string, rating: number) => {
    try {
      const result = await ratePlaylist(playlistId, rating)
      if (result.success) {
        toast({
          title: 'Avaliação salva',
          description: result.message
        })
        // Recarregar página para atualizar dados
        window.location.reload()
      } else {
        toast({
          title: 'Erro ao avaliar',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro inesperado',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const renderStarRating = (rating: number, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onRate?.(star)}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${onRate ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            <Star className="h-4 w-4" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou matéria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="focus">Foco</SelectItem>
                <SelectItem value="study">Estudo</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="break">Pausa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as matérias</SelectItem>
                {uniqueSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Music className="h-6 w-6 text-[#E55A2B] mx-auto mb-2" />
            <div className="text-2xl font-bold">{filteredPlaylists.length}</div>
            <div className="text-sm text-gray-500">Playlists</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-[#FF723A] mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(filteredPlaylists.reduce((acc, p) => acc + (p.planned_duration || 0), 0) / 60)}h
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {filteredPlaylists.filter(p => p.is_favorite).length}
            </div>
            <div className="text-sm text-gray-500">Favoritas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {filteredPlaylists.reduce((acc, p) => acc + (p.play_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Reproduções</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de playlists */}
      <div className="space-y-4">
        {filteredPlaylists.length > 0 ? (
          filteredPlaylists.map(playlist => {
            const sessionType = sessionTypeConfig[playlist.session_type as keyof typeof sessionTypeConfig]
            
            return (
              <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Thumbnail da playlist */}
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <Music className="h-8 w-8 text-white" />
                      </div>

                      {/* Informações principais */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {playlist.name}
                          </h3>
                          <Badge variant="outline" className={`text-xs ${sessionType?.color} text-white`}>
                            {sessionType?.label}
                          </Badge>
                          {playlist.is_favorite && (
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <span>{playlist.subject}</span>
                          <span>•</span>
                          <span>{playlist.planned_duration} min</span>
                          <span>•</span>
                          <span>{playlist.ai_playlist_tracks?.[0]?.count || 0} músicas</span>
                          {playlist.play_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{playlist.play_count} reproduções</span>
                            </>
                          )}
                        </div>

                        {playlist.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {playlist.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Criada em {formatDate(playlist.created_at)}</span>
                          </div>
                          {playlist.last_played_at && (
                            <div className="flex items-center space-x-1">
                              <Volume2 className="h-3 w-3" />
                              <span>Última reprodução: {formatDate(playlist.last_played_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Avaliação */}
                      <div className="text-center">
                        {playlist.user_rating ? (
                          <div className="space-y-1">
                            {renderStarRating(playlist.user_rating, (rating) => handleRate(playlist.id, rating))}
                            <div className="text-xs text-gray-500">Sua avaliação</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {renderStarRating(0, (rating) => handleRate(playlist.id, rating))}
                            <div className="text-xs text-gray-500">Avaliar</div>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlay(playlist.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Tocar
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPlaylist(playlist)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{playlist.name}</DialogTitle>
                              <DialogDescription>
                                Detalhes da playlist gerada em {formatDate(playlist.created_at)}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedPlaylist && selectedPlaylist.id === playlist.id && (
                              <div className="space-y-6">
                                {/* Contexto de geração */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Matéria:</span>
                                    <span className="ml-2">{playlist.subject}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Tipo:</span>
                                    <span className="ml-2">{sessionType?.label}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Duração:</span>
                                    <span className="ml-2">{playlist.planned_duration} min</span>
                                  </div>
                                  {playlist.user_energy_level && (
                                    <div>
                                      <span className="font-medium">Energia:</span>
                                      <span className="ml-2">{playlist.user_energy_level}/10</span>
                                    </div>
                                  )}
                                </div>

                                {/* Rationale da IA */}
                                {playlist.generation_rationale && (
                                  <div className="p-4 bg-[#FFB08A]/20 rounded-lg">
                                    <h4 className="font-medium text-[#E55A2B] mb-2">Análise da IA</h4>
                                    <p className="text-[#E55A2B]/80 text-sm">{playlist.generation_rationale}</p>
                                  </div>
                                )}

                                {/* Características musicais */}
                                {(playlist.avg_tempo || playlist.avg_energy || playlist.main_genres) && (
                                  <div>
                                    <h4 className="font-medium mb-3">Características Musicais</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                      {playlist.avg_tempo && (
                                        <div>
                                          <span className="text-gray-600">Tempo:</span>
                                          <span className="ml-2 font-medium">{playlist.avg_tempo} BPM</span>
                                        </div>
                                      )}
                                      {playlist.avg_energy && (
                                        <div>
                                          <span className="text-gray-600">Energia:</span>
                                          <span className="ml-2 font-medium">{Math.round(playlist.avg_energy * 100)}%</span>
                                        </div>
                                      )}
                                      {playlist.main_genres && playlist.main_genres.length > 0 && (
                                        <div>
                                          <span className="text-gray-600">Gêneros:</span>
                                          <span className="ml-2 font-medium">{playlist.main_genres.slice(0, 2).join(', ')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Feedback do usuário */}
                                {playlist.user_feedback && (
                                  <div>
                                    <h4 className="font-medium mb-2">Seu Feedback</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                      {playlist.user_feedback}
                                    </p>
                                  </div>
                                )}

                                {/* Ações */}
                                <div className="flex items-center space-x-3">
                                  <Button asChild className="flex-1">
                                    <a href={`https://open.spotify.com/playlist/${playlist.spotify_playlist_id}`} target="_blank">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Abrir no Spotify
                                    </a>
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => handlePlay(playlist.id)}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Reproduzir
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={`https://open.spotify.com/playlist/${playlist.spotify_playlist_id}`} 
                            target="_blank"
                            title="Abrir no Spotify"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma playlist encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedType || selectedSubject
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira playlist personalizada com IA'
                }
              </p>
              {!(searchTerm || selectedType || selectedSubject) && (
                <Button asChild>
                  <a href="/spotify">
                    <Music className="h-4 w-4 mr-2" />
                    Gerar Primeira Playlist
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}