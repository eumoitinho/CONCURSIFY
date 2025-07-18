import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Music,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Settings,
  TrendingUp,
  Clock,
  Heart,
  Star,
  Headphones,
  Radio,
  ListMusic,
  Zap
} from 'lucide-react'
import { getSpotifyConnection, getUserPlaylists, getMusicPreferences } from '@/app/actions/spotify'
import { SpotifyConnect } from '@/components/spotify/spotify-connect'
import { PlaylistGenerator } from '@/components/spotify/playlist-generator'
import { SpotifyPlayer } from '@/components/spotify/spotify-player'
import { PlaylistLibrary } from '@/components/spotify/playlist-library'
import { MusicPreferences } from '@/components/spotify/music-preferences'

async function SpotifyContent() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Buscar dados em paralelo
  const [connectionResult, playlistsResult, preferencesResult] = await Promise.all([
    getSpotifyConnection(),
    getUserPlaylists({ limit: 10 }),
    getMusicPreferences()
  ])

  const isConnected = connectionResult.success && connectionResult.data
  const connection = connectionResult.data
  const playlists = playlistsResult.success ? playlistsResult.data : []
  const preferences = preferencesResult.success ? preferencesResult.data : null

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Music className="h-8 w-8 text-green-500" />
            <span>Spotify Integrado</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Playlists personalizadas com IA para maximizar seu foco nos estudos
          </p>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-2">
            <Button asChild>
              <a href="/spotify/generator">
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar Playlist IA
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/spotify/preferences">
                <Settings className="h-4 w-4 mr-2" />
                Preferências
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Status da conexão */}
      {!isConnected ? (
        <SpotifyConnect />
      ) : (
        <>
          {/* Info da conta conectada */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {connection.profile_image_url && (
                    <img
                      src={connection.profile_image_url}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Conectado como {connection.display_name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={connection.product === 'premium' ? 'default' : 'secondary'}>
                        {connection.product === 'premium' ? 'Premium' : 'Free'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Última conexão: {new Date(connection.last_used_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Conectado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Playlists IA
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {playlists.length}
                    </p>
                  </div>
                  <ListMusic className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Horas de Foco
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(playlists.reduce((acc, p) => acc + (p.planned_duration || 0), 0) / 60)}h
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Favoritas
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {playlists.filter(p => p.is_favorite).length}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Avaliação Média
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {playlists.length > 0 
                        ? (playlists.filter(p => p.user_rating).reduce((acc, p) => acc + (p.user_rating || 0), 0) / 
                           playlists.filter(p => p.user_rating).length || 0).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conteúdo principal */}
            <div className="lg:col-span-2">
              {/* Player integrado */}
              <SpotifyPlayer connection={connection} />

              {/* Tabs de conteúdo */}
              <div className="mt-6">
                <Tabs defaultValue="generator" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generator">Gerar Playlist</TabsTrigger>
                    <TabsTrigger value="library">Biblioteca</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="generator">
                    <PlaylistGenerator preferences={preferences} />
                  </TabsContent>

                  <TabsContent value="library">
                    <PlaylistLibrary playlists={playlists} />
                  </TabsContent>

                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>Analytics Musicais</span>
                        </CardTitle>
                        <CardDescription>
                          Insights sobre seu uso de música durante os estudos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Gêneros mais usados */}
                          <div>
                            <h4 className="font-medium mb-3">Gêneros Mais Usados</h4>
                            <div className="flex flex-wrap gap-2">
                              {['Ambient', 'Lo-fi', 'Classical', 'Jazz', 'Instrumental'].map(genre => (
                                <Badge key={genre} variant="secondary">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Tipos de sessão */}
                          <div>
                            <h4 className="font-medium mb-3">Distribuição por Tipo de Sessão</h4>
                            <div className="space-y-2">
                              {[
                                { type: 'Focus', count: playlists.filter(p => p.session_type === 'focus').length, color: 'bg-[#FF723A]' },
                                { type: 'Study', count: playlists.filter(p => p.session_type === 'study').length, color: 'bg-[#E55A2B]' },
                                { type: 'Review', count: playlists.filter(p => p.session_type === 'review').length, color: 'bg-[#FFB08A]' },
                                { type: 'Break', count: playlists.filter(p => p.session_type === 'break').length, color: 'bg-orange-500' }
                              ].map(item => (
                                <div key={item.type} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                    <span className="text-sm">{item.type}</span>
                                  </div>
                                  <span className="text-sm font-medium">{item.count} playlists</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Matérias estudadas */}
                          <div>
                            <h4 className="font-medium mb-3">Matérias Mais Estudadas</h4>
                            <div className="space-y-2">
                              {Array.from(new Set(playlists.map(p => p.subject)))
                                .slice(0, 5)
                                .map(subject => (
                                  <div key={subject} className="flex items-center justify-between">
                                    <span className="text-sm">{subject}</span>
                                    <span className="text-sm font-medium">
                                      {playlists.filter(p => p.subject === subject).length} playlists
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Gerador rápido */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Geração Rápida</span>
                  </CardTitle>
                  <CardDescription>
                    Templates pré-configurados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Headphones className="h-4 w-4 mr-2" />
                    Foco Intenso (25min)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Radio className="h-4 w-4 mr-2" />
                    Estudo Profundo (45min)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Music className="h-4 w-4 mr-2" />
                    Revisão Ativa (20min)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Pausa Energizante (5min)
                  </Button>
                </CardContent>
              </Card>

              {/* Playlists recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {playlists.slice(0, 4).map(playlist => (
                      <div key={playlist.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded flex items-center justify-center">
                          <Music className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {playlist.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {playlist.subject} • {playlist.planned_duration}min
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configurações rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">IA ativada:</span>
                    <Badge variant={preferences?.enable_ai_recommendations ? "default" : "secondary"}>
                      {preferences?.enable_ai_recommendations ? "Sim" : "Não"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Instrumental:</span>
                    <Badge variant={preferences?.instrumental_only ? "default" : "secondary"}>
                      {preferences?.instrumental_only ? "Apenas" : "Qualquer"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Idioma:</span>
                    <span className="font-medium capitalize">{preferences?.language_preference || 'Qualquer'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Volume padrão:</span>
                    <span className="font-medium">{preferences?.default_volume || 50}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      asChild
                    >
                      <a href="/spotify/preferences">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Dicas da IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span>Dica da IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Baseado nos seus padrões de estudo, música instrumental no período da manhã 
                      aumenta seu foco em 23% para matérias de exatas.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Gerar Playlist Otimizada
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function SpotifyPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <SpotifyContent />
    </Suspense>
  )
}