'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {useAuthStore} from '@/stores/auth-store'
import {
    Users,
    Settings,
    Package,
    TrendingUp,
    Calendar,
    CheckCircle
} from 'lucide-react'

export function DashboardOverview() {
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)

    const getRoleWelcome = () => {
        switch (currentRole) {
            case 'superuser':
                return 'Super Administrator Dashboard'
            case 'admin':
                return 'Administrator Dashboard'
            case 'staff':
                switch (user?.staffRole) {
                    case 'TECHNICIAN':
                        return 'Technician Dashboard'
                    case 'RECEPTIONIST':
                        return 'Receptionist Dashboard'
                    default:
                        return 'Staff Dashboard'
                }
            default:
                return 'Dashboard'
        }
    }

    const getAccessibleModules = () => {
        const modules = []

        // User Management - All staff can access (with different permissions)
        modules.push({
            id: 'users',
            title: 'User Management',
            description: 'Manage customer and staff accounts',
            icon: Users,
            available: true,
            permissions: user?.staffRole === 'ADMINISTRATOR' || currentRole === 'admin' || currentRole === 'superuser'
                ? 'Full access'
                : user?.staffRole === 'TECHNICIAN'
                    ? 'View/Edit customers'
                    : 'Create/Edit customers'
        })

        // Service Management - Admin only
        if (user?.staffRole === 'ADMINISTRATOR' || currentRole === 'admin' || currentRole === 'superuser') {
            modules.push({
                id: 'services',
                title: 'Service Management',
                description: 'Manage service categories and offerings',
                icon: Settings,
                available: true,
                permissions: 'Full access'
            })
        }

        // Inventory Management - Admin and Technicians
        if (user?.staffRole === 'ADMINISTRATOR' || currentRole === 'admin' || currentRole === 'superuser' || user?.staffRole === 'TECHNICIAN') {
            modules.push({
                id: 'inventory',
                title: 'Inventory Management',
                description: 'Manage device parts and customer devices',
                icon: Package,
                available: true,
                permissions: user?.staffRole === 'TECHNICIAN'
                    ? 'Add/Edit devices & parts, Assign parts'
                    : 'Full access'
            })
        }

        return modules
    }

    const getQuickStats = () => {
        const stats = []

        // All staff see some basic stats
        stats.push(
            {
                title: 'Active Today',
                value: 'Welcome!',
                description: 'You are signed in and ready to work',
                icon: CheckCircle,
                color: 'text-green-600'
            }
        )

        // Role-specific stats
        if (user?.staffRole === 'RECEPTIONIST') {
            stats.push(
                {
                    title: 'Customer Focus',
                    value: 'Ready',
                    description: 'Create and manage customer accounts',
                    icon: Users,
                    color: 'text-blue-600'
                }
            )
        }

        if (user?.staffRole === 'TECHNICIAN') {
            stats.push(
                {
                    title: 'Repair Queue',
                    value: 'Ready',
                    description: 'Manage devices and inventory',
                    icon: Package,
                    color: 'text-orange-600'
                }
            )
        }

        if (user?.staffRole === 'ADMINISTRATOR' || currentRole === 'admin' || currentRole === 'superuser') {
            stats.push(
                {
                    title: 'System Status',
                    value: 'Online',
                    description: 'All systems operational',
                    icon: TrendingUp,
                    color: 'text-green-600'
                }
            )
        }

        return stats
    }

    const modules = getAccessibleModules()
    const stats = getQuickStats()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{getRoleWelcome()}</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here&#39;s an overview of your available modules and current status.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`}/>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Available Modules */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5"/>
                        Available Modules
                    </CardTitle>
                    <CardDescription>
                        Modules you have access to based on your role and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module) => (
                            <Card key={module.id} className="transition-colors hover:bg-muted/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <module.icon className="h-8 w-8 text-primary"/>
                                        <Badge variant="outline" className="text-xs">
                                            Available
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base">{module.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {module.description}
                                    </p>
                                    <Badge variant="secondary" className="text-xs">
                                        {module.permissions}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5"/>
                        Getting Started
                    </CardTitle>
                    <CardDescription>
                        Quick tips for using the dashboard effectively
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div>
                            <p className="text-sm font-medium">Use the sidebar navigation</p>
                            <p className="text-xs text-muted-foreground">
                                Click on any module in the sidebar to switch between different areas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div>
                            <p className="text-sm font-medium">Role-based access</p>
                            <p className="text-xs text-muted-foreground">
                                Your access level is determined by your staff role and permissions
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                        <div>
                            <p className="text-sm font-medium">Data tables and details</p>
                            <p className="text-xs text-muted-foreground">
                                Each module has overview, data table, and detail views for easy management
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}