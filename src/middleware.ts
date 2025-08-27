import {auth} from "@/lib/auth";
import {NextResponse} from "next/server";

export const runtime = 'nodejs'

const publicPaths = [
    "/",
    "/about",
    "/events",
    "/terms",
    "/services",
    "/api/auth/(.*)"
] // Auth API routes should be public

const isPublicPath = (path: string) => {
    return publicPaths.some(publicPath => {
        if (publicPath.includes("(.*)")) {
            const basePath = publicPath.replace("(.*)", "");
            return path.startsWith(basePath);
        }
        return path === publicPath;
    });
};

export default auth((req) => {
    const {nextUrl} = req;
    const isLoggedIn = !!req.auth;
    const path = nextUrl.pathname;

    // First, handle public paths (except home page for authenticated users)
    if (isPublicPath(path) && !(path === '/' && isLoggedIn)) {
        return NextResponse.next();
    }

    // Handle home page redirect for authenticated users
    if (path === '/' && isLoggedIn) {
        const user = req.auth?.user;
        
        // Redirect authenticated users to their appropriate dashboard
        if (user?.isStaff) {
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        } else {
            return NextResponse.redirect(new URL('/customer', nextUrl));
        }
    }

    // Require authentication for all protected routes
    if (!isLoggedIn) {
        const signInUrl = new URL('/auth/signin', nextUrl);
        signInUrl.searchParams.set('callbackUrl', nextUrl.href);
        return NextResponse.redirect(signInUrl);
    }

    // Role-based route protection for authenticated users
    const user = req.auth?.user;

    // Handle dashboard routes - require staff access
    if (path.startsWith('/dashboard')) {
        if (!user?.isStaff) {
            // Redirect non-staff users to customer dashboard
            return NextResponse.redirect(new URL('/customer', nextUrl));
        }
        return NextResponse.next();
    }

    // Handle customer routes - require customer role
    if (path.startsWith('/customer')) {
        if (user?.isStaff) {
            // Redirect staff users to dashboard
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return NextResponse.next();
    }

    // Handle admin routes (future expansion)
    if (path.startsWith('/admin')) {
        if (!user?.isSuperuser && !(user?.isStaff && user?.staffRole === 'ADMINISTRATOR')) {
            // Redirect non-admin users based on their role
            if (user?.isStaff) {
                return NextResponse.redirect(new URL('/dashboard', nextUrl));
            } else {
                return NextResponse.redirect(new URL('/customer', nextUrl));
            }
        }
        return NextResponse.next();
    }

    // Default: allow access to other authenticated routes
    return NextResponse.next();
});

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        "/",                  // Handle home page redirects for authenticated users
        "/dashboard/:path*",  // Protect dashboard routes (staff only)
        "/customer/:path*",   // Protect customer routes (customers only)
        "/admin/:path*",      // Protect admin routes (admin+ only)
        "/profile/:path*",    // Protect profile routes (authenticated users)
    ],
};