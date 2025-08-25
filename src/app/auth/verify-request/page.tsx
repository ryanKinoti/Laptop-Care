import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { Navigation } from '@/components/navigation'

export default function VerifyRequestPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navigation />
            
            <div className="flex flex-col items-center justify-center px-4 py-16">
                {/* Page Header */}
                <div className="w-full max-w-sm mb-8 text-center">
                    <h1 className="text-2xl font-bold">Check your email</h1>
                    <p className="text-muted-foreground mt-1">We&#39;ve sent you a sign-in link</p>
                </div>

                {/* Verification Card */}
                <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Email sent</CardTitle>
                    <CardDescription>
                        We&#39;ve sent a magic link to your email address. Click the link in your email to sign in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <h3 className="font-medium text-sm">What&#39;s next?</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Check your email inbox</li>
                            <li>• Look for an email from Laptop Care Services</li>
                            <li>• Click the &#34;Sign in&#34; button in the email</li>
                            <li>• You&#39;ll be automatically signed in</li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-3">
                            Didn&#39;t receive an email? Check your spam folder or try again.
                        </p>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/auth/signin">
                                Back to sign in
                            </Link>
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-muted-foreground pt-4">
                        Need help?{' '}
                        <Link href="/contact" className="underline underline-offset-4 hover:text-primary">
                            Contact support
                        </Link>
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
    )
}