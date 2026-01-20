import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Esto refresca la sesión si es necesario
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // --- LÓGICA DE PROTECCIÓN DE RUTAS ---
  
  // 1. Si no hay usuario y trata de acceder a dashboard
  if (!user && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/user'))) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Si hay usuario, verificar ROL en la tabla profiles
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    // Bloquear Estudiantes (r001/r002) de /admin
    if (url.pathname.startsWith('/admin') && profile?.role_id !== 'r003') {
      url.pathname = '/user'
      return NextResponse.redirect(url)
    }

    // Bloquear Admin de /user (para evitar conflictos de layouts)
    if (url.pathname.startsWith('/user') && profile?.role_id === 'r003') {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}