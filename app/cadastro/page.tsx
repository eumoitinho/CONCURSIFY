'use client'

import { useEffect, useState } from 'react'
import { signIn, getProviders, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Chrome, Mail, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignUpPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefone: '',
    concursos_interesse: [] as string[],
    nivel_estudos: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado'
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const setupProviders = async () => {
      const response = await getProviders()
      setProviders(response)
    }
    setupProviders()

    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('Error signing up with Google:', error)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (!acceptTerms) {
      alert('Você deve aceitar os termos de uso')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nome: formData.name,
          telefone: formData.telefone,
          concursos_interesse: formData.concursos_interesse,
          nivel_estudos: formData.nivel_estudos
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // Sucesso no cadastro
      if (data.needsConfirmation) {
        // Usuário precisa confirmar email
        router.push('/auth/signin?message=confirm-email')
      } else {
        // Pode fazer login imediatamente
        router.push('/auth/signin?message=account-created')
      }
    } catch (error) {
      console.error('Error signing up:', error)
      // Você pode adicionar um toast ou state para mostrar o erro
      alert(error instanceof Error ? error.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-[10%] w-24 h-24 bg-orange-500 bg-opacity-20 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-[15%] w-32 h-32 bg-orange-300 bg-opacity-30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 left-[5%] w-16 h-16 bg-orange-400 bg-opacity-25 rounded-full blur-lg"></div>
      </div>
      
      <Card className="w-full max-w-lg relative z-10 overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 border-2 border-white rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Crie sua conta
          </CardTitle>
          <p className="text-orange-100 mt-2">
            Comece sua jornada rumo à aprovação com inteligência artificial
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Sign Up */}
          {providers?.google && (
            <Button
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full"
              variant="outline"
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="mr-2 h-4 w-4" />
              )}
              Cadastrar com Google
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Ou cadastre-se com
              </span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength={8}
              />
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                Eu aceito os{' '}
                <Link href="/termos" className="text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                  Termos de Uso
                </Link>
                {' '}e{' '}
                <Link href="/privacidade" className="text-orange-500 hover:text-orange-600 hover:underline transition-colors">
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar conta grátis
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link 
                href="/auth/signin" 
                className="text-orange-500 hover:text-orange-600 hover:underline font-semibold transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </div>

          {/* Free Plan Benefits */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl border-2 border-orange-300 p-6 mt-6">
            <h4 className="font-bold text-gray-900 mb-3 text-center">🎯 Plano Gratuito inclui:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2"><span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span> 3 cronogramas personalizados com IA</li>
              <li className="flex items-center gap-2"><span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span> 5 simulados adaptativos por mês</li>
              <li className="flex items-center gap-2"><span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span> Acesso ao fórum da comunidade</li>
              <li className="flex items-center gap-2"><span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span> 10 sessões Pomodoro por dia</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}