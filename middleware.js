// Importamos la función para crear el cliente de Supabase optimizado para Server-Side (SSR)
import { createServerClient } from '@supabase/ssr'
// Importamos NextResponse para manejar redirecciones y respuestas del servidor
import { NextResponse } from 'next/server'

// Definimos las credenciales de conexión (URL de tu proyecto y clave pública)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// La función principal del Middleware que se ejecuta antes de cargar cualquier página protegida
export async function middleware(request) {
  // 1. Creamos una respuesta base que permite que la petición continúe su curso normal
  let response = NextResponse.next({
    request: {
      headers: request.headers, // Pasamos los headers originales de la petición
    },
  })

  // 2. Inicializamos el cliente de Supabase especial para el Middleware
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        // Método para leer una cookie desde la petición del navegador
        get(name) {
          return request.cookies.get(name)?.value
        },
        // Método para crear o actualizar una cookie (aquí sucede la magia del Refresh Token)
        set(name, value, options) {
          // Actualizamos la cookie en la petición (Request)
          request.cookies.set({ name, value, ...options })
          // Creamos una nueva respuesta para aplicar los cambios
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          // Establecemos la nueva cookie en la respuesta (Response) que irá al navegador
          response.cookies.set({ name, value, ...options })
        },
        // Método para borrar una cookie (útil al cerrar sesión)
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Verificamos quién es el usuario actual. 
  // IMPORTANTE: .getUser() valida el JWT y si ha expirado, usa el Refresh Token automáticamente.
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Obtenemos la ruta actual que el usuario intenta visitar
  const { pathname } = request.nextUrl
  // Comprobamos si la ruta es de registro o login (páginas de autenticación)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  // --- LÓGICA DE REDIRECCIÓN (PROTECCIÓN DE RUTAS) ---
  
  // A. Si el usuario NO está logueado y NO está en una página de Auth (intentando entrar a algo privado)
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone() // Clonamos la URL actual
    url.pathname = '/login'             // Cambiamos el destino al login
    return NextResponse.redirect(url)   // Ejecutamos la redirección
  }

  // B. Si el usuario SÍ está logueado pero intenta ir al login, registro o la raíz '/'
  if (user && (isAuthPage || pathname === '/')) {
    const url = request.nextUrl.clone() // Clonamos la URL actual
    url.pathname = '/dashboard'         // Lo mandamos directo a su panel de control
    return NextResponse.redirect(url)   // Ejecutamos la redirección
  }

  // 5. Si todo está correcto, devolvemos la respuesta (con las cookies actualizadas si hubo refresco)
  return response
}

// Configuración para definir en qué rutas se debe ejecutar este Middleware
export const config = {
  matcher: [
    /*
     * Esta expresión regular (Regex) le dice a Next.js que ejecute el middleware en todo, EXCEPTO:
     * - Archivos internos de Next.js (_next/static, _next/image)
     * - El favicon.ico
     * - Cualquier archivo que termine en extensiones de imagen (svg, png, jpg, etc.) en la carpeta public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}