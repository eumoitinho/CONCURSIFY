import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Rotas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/callback',
    '/cadastro',
    '/planos'
  ]

  // Se é uma rota pública, prosseguir
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Verificar token de autenticação nos cookies
  const token = req.cookies.get('sb-access-token')?.value ||
                req.cookies.get('supabase-auth-token')?.value

  // Se não há token e está tentando acessar rota protegida
  if (!token) {
    const protectedRoutes = [
      '/dashboard',
      '/concursos',
      '/forum',
      '/caderno', 
      '/pomodoro',
      '/spotify',
      '/simulados',
      '/subscription'
    ]

    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Para APIs protegidas
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}