'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {useAuthStore} from '@/stores/auth-store'
import {
    Package,
    Clock,
    CheckCircle,
    Plus,
    FileText,
    Calendar,
} from 'lucide-react'

export function CustomerDashboard() {
    const session = useAuthStore(state => state.session)

    // Mock data - replace with actual API calls
    const stats = {
        activeOrders: 2,
        completedOrders: 8,
        totalSpent: 15400, // in KES
        lastService: '2024-01-15'
    }

    const recentOrders = [
        {
            id: 'ORD-001',
            service: 'Laptop Screen Repair',
            device: 'MacBook Pro 13"',
            status: 'In Progress',
            date: '2024-01-20',
            amount: 8500
        },
        {
            id: 'ORD-002',
            service: 'Hard Drive Replacement',
            device: 'Dell Latitude',
            status: 'Pending',
            date: '2024-01-18',
            amount: 6900
        },
        {
            id: 'ORD-003',
            service: 'Virus Removal',
            device: 'HP Pavilion',
            status: 'Completed',
            date: '2024-01-10',
            amount: 2500
        }
    ]

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'default'
            case 'in progress':
                return 'secondary'
            case 'pending':
                return 'outline'
            default:
                return 'outline'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'Customer'}!
                </h1>
                <p className="text-muted-foreground mt-1">
                    Here&apos;s what&apos;s happening with your devices and services.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently being serviced
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Successfully completed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">
                            All time spending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Service</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Date(stats.lastService).toLocaleDateString('en-KE', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most recent service
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks and shortcuts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button>
                            <Plus className="h-4 w-4 mr-2"/>
                            Request New Service
                        </Button>
                        <Button variant="outline">
                            <Clock className="h-4 w-4 mr-2"/>
                            Track Existing Order
                        </Button>
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2"/>
                            Download Receipt
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>
                        Your latest service requests and their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{order.service}</span>
                                        <Badge variant={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {order.device} • {order.id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(order.date).toLocaleDateString('en-KE')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatCurrency(order.amount)}</p>
                                    <Button variant="ghost" size="sm" className="mt-1">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Button variant="outline" className="w-full">
                            View All Orders
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}