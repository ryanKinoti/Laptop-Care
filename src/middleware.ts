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

    // Redirect unauthenticated users to sign-in page
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/api/auth/signin", nextUrl));
    }
    return NextResponse.next();
});

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        // Temporarily disable middleware - no routes protected
        // "/protected/:path*",  // Uncomment when you want to protect specific routes
        // "/dashboard/:path*",  // Protect dashboard routes
        // "/admin/:path*",      // Protect admin routes
        // "/profile/:path*",    // Protect profile routes
    ],
};