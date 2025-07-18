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
    email: '',
    password: '',
    confirmPassword: ''
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
      // Here you would typically call your signup API
      // For now, we'll just redirect to sign in
      console.log('Sign up data:', formData)
      
      // After successful signup, redirect to signin
      router.push('/auth/signin?message=account-created')
    } catch (error) {
      console.error('Error signing up:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 bg-[#FF723A] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Crie sua conta
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Comece sua jornada rumo à aprovação no concurso dos seus sonhos
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Sign Up */}
          {providers?.google && (
            <Button
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
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
                onCheckedChange={setAcceptTerms}
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                Eu aceito os{' '}
                <Link href="/termos" className="text-[#FF723A] hover:underline">
                  Termos de Uso
                </Link>
                {' '}e{' '}
                <Link href="/privacidade" className="text-[#FF723A] hover:underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full bg-[#FF723A] hover:bg-[#E55A2B]"
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
                className="text-[#FF723A] hover:underline font-medium"
              >
                Fazer login
              </Link>
            </div>
          </div>

          {/* Free Plan Benefits */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Plano Gratuito inclui:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ 3 cronogramas personalizados</li>
              <li>✓ 5 simulados por mês</li>
              <li>✓ Acesso ao fórum da comunidade</li>
              <li>✓ 10 sessões Pomodoro por dia</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}