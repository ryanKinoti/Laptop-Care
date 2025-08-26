import {auth} from "@/lib/auth";
import {NextResponse} from "next/server";

export const runtime = 'nodejs'

const publicPaths = [
    "/",
    "/about",
    "/events",
    "/terms",
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

    // Allow access to public paths regardless of authentication status
    if (isPublicPath(path)) {
        return NextResponse.next();
    }

    // Handle dashboard routes - require authentication and staff access
    if (path.startsWith('/dashboard')) {
        if (!isLoggedIn) {
            const signInUrl = new URL('/auth/signin', nextUrl);
            signInUrl.searchParams.set('callbackUrl', nextUrl.href);
            return NextResponse.redirect(signInUrl);
        }
        
        // Check if a user is staff
        if (!req.auth?.user?.isStaff) {
            // Redirect non-staff users to home
            return NextResponse.redirect(new URL('/', nextUrl));
        }
    }

    // Redirect unauthenticated users to sign-in page for other protected routes
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/api/auth/signin", nextUrl));
    }
    return NextResponse.next();
});

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        "/dashboard/:path*",  // Protect dashboard routes
        // "/admin/:path*",      // Protect admin routes (when implemented)
        // "/profile/:path*",    // Protect profile routes (when implemented)
    ],
};