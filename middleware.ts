import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getFeatureFromPath } from '@/lib/middleware/subscription-check'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Verificar autenticação para rotas protegidas
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Adicionar user ID aos headers para as APIs
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', token.sub || '')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Verificar acesso a páginas protegidas
  const protectedRoutes = [
    '/concursos',
    '/forum',
    '/caderno', 
    '/pomodoro',
    '/spotify',
    '/simulados',
    '/subscription'
  ]

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
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