'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Music, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Shield,
  Zap,
  Clock,
  Brain
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function SpotifyConnect() {
  const { toast } = useToast()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    
    try {
      const response = await fetch('/api/spotify/auth')
      const data = await response.json()
      
      if (data.authUrl) {
        // Redirecionar para autorização do Spotify
        window.location.href = data.authUrl
      } else {
        throw new Error('Failed to get authorization URL')
      }
    } catch (error) {
      console.error('Erro ao conectar Spotify:', error)
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar com o Spotify. Tente novamente.',
        variant: 'destructive'
      })
      setIsConnecting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-400 to-blue-500 opacity-10"></div>
        <CardHeader className="relative">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Conecte sua conta Spotify</CardTitle>
              <CardDescription className="text-lg">
                Playlists personalizadas com IA para maximizar seu foco nos estudos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-[#E55A2B] mt-1" />
              <div>
                <h4 className="font-medium">IA Personalizada</h4>
                <p className="text-sm text-gray-600">
                  Algoritmo que aprende seus gostos e cria playlists ideais para cada matéria
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Brain className="h-5 w-5 text-[#FF723A] mt-1" />
              <div>
                <h4 className="font-medium">Foco Científico</h4>
                <p className="text-sm text-gray-600">
                  Música selecionada para aumentar concentração e performance de estudo
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-medium">Integração Total</h4>
                <p className="text-sm text-gray-600">
                  Sincronizado com Pomodoro, notas de estudo e cronogramas
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              size="lg" 
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
            >
              {isConnecting ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Music className="h-5 w-5 mr-2" />
                  Conectar com Spotify
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#E55A2B]" />
              <span>IA Generativa</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Análise de contexto de estudo</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Recomendações por matéria</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Adaptação por horário e energia</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Geração automática de playlists</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-[#FF723A]" />
              <span>Integração Pomodoro</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Controle automático durante sessões</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Pausa inteligente nos intervalos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Música diferente para pausas</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Analytics de performance musical</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Segurança */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>Privacidade garantida:</strong> Seus dados musicais são criptografados e nunca compartilhados. 
            Você pode desconectar a qualquer momento.
          </span>
          <Button variant="ghost" size="sm" asChild>
            <a href="https://developer.spotify.com/documentation/general/guides/authorization-guide/" target="_blank">
              Saiba mais <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </AlertDescription>
      </Alert>

      {/* FAQ rápido */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Preciso ter Spotify Premium?</h4>
            <p className="text-sm text-gray-600">
              Não, funciona com contas gratuitas. Porém, Premium oferece controles avançados e qualidade superior.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Como a IA escolhe as músicas?</h4>
            <p className="text-sm text-gray-600">
              Analisamos matéria, tipo de sessão, horário, seu histórico musical e características como instrumentalidade e energia.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Posso usar minhas próprias playlists?</h4>
            <p className="text-sm text-gray-600">
              Sim! A IA pode analisar suas playlists existentes e criar variações otimizadas para estudo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}