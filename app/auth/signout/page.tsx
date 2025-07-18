'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SignOutPage() {
  const [loading, setLoading] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF723A]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-12 h-12 bg-[#FF723A] rounded-full flex items-center justify-center">
              <LogOut className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sair da conta
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Tem certeza que deseja sair da sua conta?
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {session.user && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-3">
                {session.user.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || 'User'} 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {session.user.name || 'Usuário'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saindo...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sim, sair da conta
                </>
              )}
            </Button>

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Você será redirecionado para a página inicial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}