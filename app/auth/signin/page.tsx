'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Chrome, Mail, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, signIn, signInWithGoogle } = useAuth()

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!isLoading && user) {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)
    }
  }, [user, isLoading, router, searchParams])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      // O Google OAuth redireciona automaticamente
    } catch (error) {
      console.error('Error signing in with Google:', error)
      setError('Erro ao fazer login com Google')
      setGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await signIn(email, password)
      if (result.error) {
        throw result.error
      }
      // O redirecionamento será feito automaticamente pelo useEffect
    } catch (error: any) {
      console.error('Error signing in:', error)
      setError(error.message || 'Erro ao fazer login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-20 h-20 bg-orange-500 bg-opacity-20 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 right-[15%] w-32 h-32 bg-orange-300 bg-opacity-30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-[5%] w-16 h-16 bg-orange-400 bg-opacity-25 rounded-full blur-lg"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 border-2 border-white rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Entrar no Concursify
          </CardTitle>
          <p className="text-orange-100 mt-2">
            Acesse sua conta e continue sua jornada rumo à aprovação com IA
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full"
            variant="outline"
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Chrome className="mr-2 h-4 w-4" />
            )}
            Continuar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Ou continue com
              </span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Entrar com Email
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center space-y-2">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              Esqueceu sua senha?
            </Link>
            
            <div className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                href="/cadastro" 
                className="text-orange-500 hover:text-orange-600 hover:underline font-semibold transition-colors"
              >
                Cadastre-se grátis
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}