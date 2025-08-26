'use client'

import React, {useState, Suspense} from 'react'
import {signIn} from 'next-auth/react'
import {useSearchParams} from 'next/navigation'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {Loader2, Mail} from 'lucide-react'
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link'
import {Navigation} from '@/components/navigation'

function SignInContent() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [message, setMessage] = useState('')
    const searchParams = useSearchParams()
    const error = searchParams?.get('error')
    const callbackUrl = searchParams?.get('callbackUrl') || '/'

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        setMessage('')

        try {
            const result = await signIn('nodemailer', {
                email,
                callbackUrl,
                redirect: false,
            })

            if (result?.error) {
                setMessage('Failed to send magic link. Please try again.')
            } else {
                setMessage('Check your email for a magic link to sign in!')
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true)
        await signIn('google', {callbackUrl})
    }

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'OAuthSignin':
                return 'Error occurred during sign in with Google'
            case 'OAuthCallback':
                return 'Error occurred during Google OAuth callback'
            case 'OAuthCreateAccount':
                return 'Could not create account with Google'
            case 'EmailCreateAccount':
                return 'Could not create account with this email'
            case 'Callback':
                return 'Error occurred during callback'
            case 'OAuthAccountNotLinked':
                return 'Email already registered with different provider'
            case 'EmailSignin':
                return 'Check your email for the sign in link'
            case 'CredentialsSignin':
                return 'Invalid credentials provided'
            case 'SessionRequired':
                return 'Please sign in to access this page'
            default:
                return 'An error occurred during sign in'
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <Navigation/>

            <div className="flex flex-col items-center justify-center px-4 py-16">
                {/* Page Header */}
                <div className="w-full max-w-sm mb-8 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground mt-1">Sign in to your account</p>
                </div>

                {/* Auth Card */}
                <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">Sign in</CardTitle>
                        <CardDescription className="text-center">
                            Choose your preferred sign in method
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {getErrorMessage(error)}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Success Message */}
                        {message && (
                            <Alert>
                                <Mail className="h-4 w-4"/>
                                <AlertDescription>
                                    {message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Google Sign In */}
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isLoading}>
                            {isGoogleLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            ) : (
                                <FcGoogle className="mr-2 h-4 w-4"/>
                            )}
                            Continue with Google
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"/>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Magic Link Form */}
                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email"
                                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading || isGoogleLoading}
                                    required
                                    className="w-full"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full text-white"
                                disabled={isLoading || isGoogleLoading || !email}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        Sending magic link...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4"/>
                                        Send magic link
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="text-center text-xs text-muted-foreground pt-4">
                            By signing in, you agree to our{' '}
                            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                                Privacy Policy
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function SignInFallback() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            
            <div className="flex flex-col items-center justify-center px-4 py-16">
                {/* Page Header */}
                <div className="w-full max-w-sm mb-8 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground mt-1">Sign in to your account</p>
                </div>

                {/* Loading Card */}
                <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center">Sign in</CardTitle>
                        <CardDescription className="text-center">
                            Loading...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={<SignInFallback />}>
            <SignInContent />
        </Suspense>
    )
}