import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Criar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
      },
    }
  )

  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession()

  // Verificar autenticação para rotas protegidas de API
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Adicionar user ID aos headers para as APIs
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', session.user.id)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Verificar acesso a páginas protegidas
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
    if (!session) {
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