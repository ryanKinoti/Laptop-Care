'use client'

import {useEffect, useState} from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Skeleton} from '@/components/ui/skeleton'
import {getUserStatsAction} from '@/lib/actions/user'
import {useDashboardStore} from '@/stores/dashboard-store'
import {Users, UserCheck, Shield, UserX, RefreshCw} from 'lucide-react'

interface UserStats {
    totalUsers: number
    activeUsers: number
    staffUsers: number
    customerUsers: number
    blockedUsers: number
}

export function UserOverview() {
    const [stats, setStats] = useState<UserStats | null>(null)
    const [error, setError] = useState<string | null>(null)
    
    // Use centralized loading states
    const loading = useDashboardStore(state => state.userOverviewLoading)
    const refreshing = useDashboardStore(state => state.userDataTableRefreshing) // Share refreshing state
    const setLoading = useDashboardStore(state => state.setUserOverviewLoading)
    const setRefreshing = useDashboardStore(state => state.setUserDataTableRefreshing)
    const userStatsRefreshKey = useDashboardStore(state => state.userStatsRefreshKey)

    const fetchStats = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }
            setError(null)
            
            const result = await getUserStatsAction()
            if (result.success && result.data) {
                setStats(result.data)
            } else {
                setError(result.error || 'Failed to load stats')
            }
        } catch (err) {
            setError('Failed to load user statistics')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = () => {
        fetchStats(true)
    }

    useEffect(() => {
        fetchStats()
    }, [userStatsRefreshKey]) // React to refresh key changes

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24"/>
                            <Skeleton className="h-4 w-4"/>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-16 mb-1"/>
                            <Skeleton className="h-3 w-32"/>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!stats) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">User Statistics</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            All registered users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently active accounts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.staffUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Staff and administrators
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customerUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Customer accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {stats.blockedUsers > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5 text-destructive"/>
                            Blocked Users
                        </CardTitle>
                        <CardDescription>
                            Users who have been deactivated or blocked
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">{stats.blockedUsers}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            These accounts require attention or reactivation
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}