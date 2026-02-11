import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        }
    );

    // IMPORTANT: Do NOT run code between createServerClient and supabase.auth.getUser()
    // Any code here could cause subtle issues with fresh token refreshes.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protect /admin routes: redirect unauthenticated users to /login
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    }

    // Redirect authenticated users away from /login
    if (request.nextUrl.pathname === '/login' && user) {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - Public assets
         */
        '/((?!_not-found|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
