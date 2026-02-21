import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isProfileRoute = request.nextUrl.pathname.startsWith('/profile')
    const isProtected = isDashboardRoute || isAdminRoute || isProfileRoute

    if (!user && isProtected) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (user) {
        // Use plain createClient for service role profile lookup in middleware
        // to bypass RLS issues that can affect server-side checks
        const { createClient: createAdmin } = await import('@supabase/supabase-js')
        const adminClient = createAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: profile } = await adminClient
            .from('profiles')
            .select('rol, activo')
            .eq('id', user.id)
            .single()

        const isAdmin = profile?.rol === 'admin'

        // Redirections
        if (isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        if (isAdminRoute && !isAdmin) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        if (request.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/',
        '/dashboard/:path*',
        '/admin/:path*',
        '/profile/:path*',
        '/auth/:path*'
    ],
}
