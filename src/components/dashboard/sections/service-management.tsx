'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { Settings, Lock } from 'lucide-react'

export function ServiceManagement() {
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)

    const hasAccess = user?.staffRole === 'ADMINISTRATOR' || 
                     currentRole === 'admin' || 
                     currentRole === 'superuser'

    if (!hasAccess) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                            <h3 className="text-lg font-semibold">Access Restricted</h3>
                            <p className="text-muted-foreground">
                                Service management is only available to administrators.
                            </p>
                            <Badge variant="outline" className="text-destructive">
                                Insufficient Permissions
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Service Management Module
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <Settings className="h-12 w-12 text-primary mx-auto" />
                        <h3 className="text-lg font-semibold">Module Under Development</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            The service management module is currently being developed. 
                            This will include service categories, service offerings, pricing management, 
                            and service configuration.
                        </p>
                        <Badge variant="outline" className="text-blue-600">
                            Coming Soon
                        </Badge>
                    </div>

                    <div className="border rounded-lg p-6 bg-muted/20">
                        <h4 className="font-semibold mb-3">Planned Features:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Service category management
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Individual service configuration
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Pricing and time estimates
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Device type associations
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Service availability management
                            </li>
                        </ul>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            You can currently manage services through the existing seeder system. 
                            The full management interface will be available in a future update.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}