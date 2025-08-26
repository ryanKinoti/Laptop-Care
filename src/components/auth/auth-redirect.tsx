'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

export function AuthRedirect() {
    const router = useRouter()
    const user = useAuthStore(state => state.user)
    const isAuthenticated = useAuthStore(state => state.isAuthenticated)
    const status = useAuthStore(state => state.status)

    useEffect(() => {
        // Only redirect if user is authenticated and we have user data
        if (status === 'authenticated' && isAuthenticated() && user) {
            // Check if user is staff - redirect to dashboard
            if (user.isStaff) {
                router.push('/dashboard')
            }
            // For customers, redirect to home for now (or track order page when available)
            else {
                router.push('/')
            }
        }
    }, [status, user, isAuthenticated, router])

    return null // This component doesn't render anything
}