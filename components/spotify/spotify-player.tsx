'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
  ExternalLink,
  Monitor,
  Smartphone,
  Speaker
} from 'lucide-react'
import { pausePlayback, resumePlayback } from '@/app/actions/spotify'
import { useToast } from '@/hooks/use-toast'

interface SpotifyPlayerProps {
  connection: any
}

interface PlaybackState {
  is_playing: boolean
  item?: {
    id: string
    name: string
    artists: Array<{ name: string }>
    album: {
      name: string
      images: Array<{ url: string }>
    }
    duration_ms: number
  }
  progress_ms: number
  device?: {
    id: string
    name: string
    type: string
    volume_percent: number
  }
  repeat_state: string
  shuffle_state: boolean
}

export function SpotifyPlayer({ connection }: SpotifyPlayerProps) {
  const { toast } = useToast()
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolume] = useState(50)

  // Buscar estado inicial da reprodução
  useEffect(() => {
    fetchPlaybackState()
    
    // Atualizar a cada 5 segundos quando tocando
    const interval = setInterval(() => {
      if (playbackState?.is_playing) {
        fetchPlaybackState()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchPlaybackState = async () => {
    try {
      const response = await fetch('/api/spotify/playback', {
        headers: {
          'Authorization': `Bearer ${connection.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlaybackState(data)
        if (data?.device?.volume_percent) {
          setVolume(data.device.volume_percent)
        }
      } else if (response.status === 204) {
        // Nenhum dispositivo ativo
        setPlaybackState(null)
      }
    } catch (error) {
      console.error('Erro ao buscar estado da reprodução:', error)
    }
  }

  const handlePlayPause = async () => {
    if (!playbackState) return
    
    setIsLoading(true)
    try {
      if (playbackState.is_playing) {
        const result = await pausePlayback()
        if (result.success) {
          setPlaybackState(prev => prev ? { ...prev, is_playing: false } : null)
        } else {
          toast({
            title: 'Erro',
            description: result.error,
            variant: 'destructive'
          })
        }
      } else {
        const result = await resumePlayback()
        if (result.success) {
          setPlaybackState(prev => prev ? { ...prev, is_playing: true } : null)
        } else {
          toast({
            title: 'Erro',
            description: result.error,
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      toast({
        title: 'Erro na reprodução',
        description: 'Não foi possível controlar a reprodução',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'computer':
        return Monitor
      case 'smartphone':
      case 'mobile':
        return Smartphone
      case 'speaker':
      case 'audio_dongle':
        return Speaker
      default:
        return Music
    }
  }

  if (!playbackState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="h-5 w-5" />
            <span>Player Spotify</span>
          </CardTitle>
          <CardDescription>
            Nenhuma reprodução ativa no momento
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Music className="h-12 w-12 mx-auto mb-3" />
            <p className="text-sm">Inicie a reprodução no Spotify para ver os controles aqui</p>
          </div>
          <Button variant="outline" asChild>
            <a href="https://open.spotify.com" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Spotify
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const track = playbackState.item
  const progress = (playbackState.progress_ms / (track?.duration_ms || 1)) * 100
  const DeviceIcon = getDeviceIcon(playbackState.device?.type || '')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5" />
            <span>Player Spotify</span>
          </div>
          {playbackState.device && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <DeviceIcon className="h-4 w-4" />
              <span>{playbackState.device.name}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {track && (
          <>
            {/* Info da música atual */}
            <div className="flex items-center space-x-4">
              {track.album.images[0] && (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-16 h-16 rounded-lg shadow-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {track.name}
                </h3>
                <p className="text-gray-600 truncate">
                  {track.artists.map(artist => artist.name).join(', ')}
                </p>
                <p className="text-gray-500 text-sm truncate">
                  {track.album.name}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a 
                  href={`https://open.spotify.com/track/${track.id}`} 
                  target="_blank"
                  title="Abrir no Spotify"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatTime(playbackState.progress_ms)}</span>
                <span>{formatTime(track.duration_ms)}</span>
              </div>
            </div>

            {/* Controles de reprodução */}
            <div className="flex items-center justify-center space-x-4">
              <Button variant="ghost" size="sm" disabled>
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={handlePlayPause}
                disabled={isLoading}
                size="lg"
                className="rounded-full w-12 h-12"
              >
                {playbackState.is_playing ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm" disabled>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Estados de reprodução */}
            <div className="flex items-center justify-center space-x-4">
              <Badge variant={playbackState.shuffle_state ? "default" : "outline"}>
                <Shuffle className="h-3 w-3 mr-1" />
                Aleatório
              </Badge>
              <Badge variant={playbackState.repeat_state !== 'off' ? "default" : "outline"}>
                <Repeat className="h-3 w-3 mr-1" />
                Repetir
              </Badge>
            </div>

            {/* Controle de volume */}
            <div className="flex items-center space-x-3">
              <VolumeX className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <Slider
                  value={[volume]}
                  onValueChange={([value]) => setVolume(value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
              <Volume2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 w-8">{volume}%</span>
            </div>
          </>
        )}

        {/* Status de conexão */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Conectado como {connection.display_name}</span>
            </div>
            <Badge variant={connection.product === 'premium' ? 'default' : 'secondary'}>
              {connection.product}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}