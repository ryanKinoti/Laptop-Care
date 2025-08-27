'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStore } from '@/stores/dashboard-store'
import { getServiceStatsAction } from '@/lib/actions/service'
import { ServiceStatsResult } from '@/types/service'
import { 
    Package, 
    Tag, 
    Activity, 
    TrendingUp,
    Laptop,
    Smartphone,
    Tablet,
    Gamepad2
} from 'lucide-react'

const deviceIcons = {
    LAPTOP: Laptop,
    PHONE: Smartphone,
    TABLET: Tablet,
    GAMING: Gamepad2,
} as const

export function ServiceOverview() {
    const [stats, setStats] = useState<ServiceStatsResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    const serviceOverviewLoading = useDashboardStore(state => state.serviceOverviewLoading)
    const setServiceOverviewLoading = useDashboardStore(state => state.setServiceOverviewLoading)
    const serviceStatsRefreshKey = useDashboardStore(state => state.serviceStatsRefreshKey)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setServiceOverviewLoading(true)
                setError(null)
                
                const result = await getServiceStatsAction()
                if (result.success && result.data) {
                    setStats(result.data)
                } else {
                    setError(result.error || 'Failed to fetch service statistics')
                }
            } catch (err) {
                setError('An unexpected error occurred')
                console.error('Service stats fetch error:', err)
            } finally {
                setServiceOverviewLoading(false)
            }
        }

        fetchStats()
    }, [serviceStatsRefreshKey, setServiceOverviewLoading])

    if (serviceOverviewLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    <Skeleton className="h-4 w-20" />
                                </CardTitle>
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-16 mb-1" />
                                <Skeleton className="h-3 w-24" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle><Skeleton className="h-5 w-32" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <Skeleton className="h-6 w-8" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle><Skeleton className="h-5 w-36" /></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-8" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="text-destructive">
                            <Activity className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">Error Loading Statistics</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!stats) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                        <h3 className="text-lg font-semibold">No Statistics Available</h3>
                        <p className="text-muted-foreground">
                            Service statistics could not be loaded at this time.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalServices}</div>
                        <p className="text-xs text-muted-foreground">
                            All services in system
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activeServices}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently available
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Services</CardTitle>
                        <Activity className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.inactiveServices}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently disabled
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCategories}</div>
                        <p className="text-xs text-muted-foreground">
                            Service categories
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Services by Device Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.servicesByDevice.map((deviceStat) => {
                                const IconComponent = deviceIcons[deviceStat.device as keyof typeof deviceIcons] || Package
                                return (
                                    <div key={deviceStat.device} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {deviceStat.device.charAt(0).toUpperCase() + deviceStat.device.slice(1).toLowerCase()}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="font-mono">
                                            {deviceStat.count}
                                        </Badge>
                                    </div>
                                )
                            })}
                            
                            {stats.servicesByDevice.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No services found for any device types
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Services by Category
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.servicesByCategory.map((categoryStat) => (
                                <div key={categoryStat.categoryName} className="flex items-center justify-between">
                                    <span className="text-sm font-medium truncate">
                                        {categoryStat.categoryName}
                                    </span>
                                    <Badge variant="outline" className="font-mono">
                                        {categoryStat.count}
                                    </Badge>
                                </div>
                            ))}
                            
                            {stats.servicesByCategory.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No services found in any categories
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}