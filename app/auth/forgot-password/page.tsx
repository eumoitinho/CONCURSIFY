'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await resetPassword(email)

      if (result.error) {
        throw result.error
      }

      setSent(true)
      setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
    } catch (error: any) {
      console.error('Error sending reset email:', error)
      setError(error.message || 'Erro ao enviar email de recuperação')
    } finally {
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

      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95 relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-4">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Recuperar Senha
          </CardTitle>
          <p className="text-sm text-gray-600">
            Digite seu email para receber instruções de recuperação
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Email Enviado!
                </h3>
                <p className="text-sm text-gray-600">
                  Enviamos instruções de recuperação para <strong>{email}</strong>.
                  Verifique sua caixa de entrada e siga as instruções.
                </p>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  <strong>Não recebeu o email?</strong> Verifique sua pasta de spam ou lixo eletrônico. 
                  O email pode levar alguns minutos para chegar.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => {
                  setSent(false)
                  setEmail('')
                  setMessage('')
                  setError('')
                }}
                variant="outline"
                className="w-full"
              >
                Enviar Novamente
              </Button>
            </div>
          )}

          {message && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar para Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 