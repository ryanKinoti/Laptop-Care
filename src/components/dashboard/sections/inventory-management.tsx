'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { Package, Lock } from 'lucide-react'

export function InventoryManagement() {
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)

    const hasAccess = user?.staffRole === 'ADMINISTRATOR' || 
                     currentRole === 'admin' || 
                     currentRole === 'superuser' ||
                     user?.staffRole === 'TECHNICIAN'

    if (!hasAccess) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
                            <h3 className="text-lg font-semibold">Access Restricted</h3>
                            <p className="text-muted-foreground">
                                Inventory management is only available to administrators and technicians.
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

    const getAccessLevel = () => {
        if (user?.staffRole === 'ADMINISTRATOR' || currentRole === 'admin' || currentRole === 'superuser') {
            return 'Full Access'
        }
        if (user?.staffRole === 'TECHNICIAN') {
            return 'Add/Edit Devices & Parts, Assign Parts'
        }
        return 'Limited Access'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                <Badge variant="outline" className="text-blue-600">
                    {getAccessLevel()}
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Inventory Management Module
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <Package className="h-12 w-12 text-primary mx-auto" />
                        <h3 className="text-lg font-semibold">Module Under Development</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            The inventory management module is currently being developed. 
                            This will include device management, parts inventory, stock tracking, 
                            and repair part assignment.
                        </p>
                        <Badge variant="outline" className="text-blue-600">
                            Coming Soon
                        </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="border rounded-lg p-4 bg-muted/20">
                            <h4 className="font-semibold mb-3">Device Management:</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Customer device registration
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Device status tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Repair history logging
                                </li>
                            </ul>
                        </div>

                        <div className="border rounded-lg p-4 bg-muted/20">
                            <h4 className="font-semibold mb-3">Parts Inventory:</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Shop-owned parts tracking
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Stock level management
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    Part movement logging
                                </li>
                            </ul>
                        </div>
                    </div>

                    {user?.staffRole === 'TECHNICIAN' && (
                        <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                            <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                                Technician Features:
                            </h4>
                            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                                <li>• Add and edit customer devices</li>
                                <li>• Assign shop-owned parts for repairs</li>
                                <li>• Update device repair status</li>
                                <li>• Log repair history and part movements</li>
                            </ul>
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            The database schemas for devices, parts, and movements are already in place. 
                            The management interface will be available in the next update.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}