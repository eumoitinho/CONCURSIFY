import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'

export const metadata: Metadata = {
  title: 'Concursify - Sua Aprovação com Inteligência Artificial',
  description: 'Plataforma completa para preparação de concursos públicos com IA, cronogramas personalizados, simulados adaptativos e comunidade ativa.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
