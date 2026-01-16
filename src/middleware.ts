import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set({ name, value, ...options })
                    )
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set({ name, value, ...options })
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes logic
    if (user) {
        // Check if onboarding is completed
        const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single()

        const isComplete = profile?.onboarding_completed
        const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding')
        const isAuth = request.nextUrl.pathname.startsWith('/auth') ||
            request.nextUrl.pathname === '/login' ||
            request.nextUrl.pathname === '/signup'

        if (!isComplete && !isOnboarding && !isAuth && request.nextUrl.pathname !== '/') {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        if (isComplete && isOnboarding) {
            return NextResponse.redirect(new URL('/discover', request.url))
        }
    } else {
        const isProtectedRoute = request.nextUrl.pathname.startsWith('/discover') ||
            request.nextUrl.pathname.startsWith('/matches') ||
            request.nextUrl.pathname.startsWith('/chat') ||
            request.nextUrl.pathname.startsWith('/profile') ||
            request.nextUrl.pathname.startsWith('/onboarding')

        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
