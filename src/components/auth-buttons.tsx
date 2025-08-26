'use client'

import {signIn, signOut} from "next-auth/react"
import {Button} from "@/components/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Skeleton} from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {User, Settings, LogOut, Shield, BarChart3, Users, Wrench} from "lucide-react"
import {useAuthStore, useAuthSync} from '@/stores/auth-store'
import Link from "next/link"

export function AuthButtons() {
    const {isInitialized, status} = useAuthSync()
    const session = useAuthStore(state => state.session)
    const user = useAuthStore(state => state.user) // Our custom role data
    const currentRole = useAuthStore(state => state.currentRole)
    const canAccess = useAuthStore(state => state.canAccess)
    const isCustomer = useAuthStore(state => state.isCustomer)

    if (status === "loading" || !isInitialized) {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20"/>
                <Skeleton className="h-8 w-8 rounded-full"/>
            </div>
        )
    }

    if (!user || !session?.user) {
        return (
            <Button onClick={() => signIn()} variant="outline" size="sm">
                Sign In
            </Button>
        )
    }

    const getRoleDisplay = () => {
        switch (currentRole) {
            case 'superuser':
                return 'Super Admin'
            case 'admin':
                return 'Administrator'
            case 'staff':
                // Use the specific staff role from the database
                switch (user.staffRole) {
                    case 'TECHNICIAN':
                        return 'Technician'
                    case 'RECEPTIONIST':
                        return 'Receptionist'
                    case 'ADMINISTRATOR':
                        return 'Administrator'
                    default:
                        return 'Staff Member'
                }
            case 'customer':
                return user.customerRole === 'COMPANY' ? 'Business Customer' : 'Individual Customer'
            default:
                return 'User'
        }
    }

    const getMenuItems = () => {
        const items = []

        // Profile (always available to authenticated users)
        items.push(
            <DropdownMenuItem key="profile" asChild>
                <Link href="/profile">
                    <User className="mr-2 h-4 w-4"/>
                    <span>Profile</span>
                </Link>
            </DropdownMenuItem>
        )

        // Customer-specific: Order tracking
        if (isCustomer() && canAccess('customerOrders')) {
            items.push(
                <DropdownMenuItem key="orders" asChild>
                    <Link href="/orders">
                        <Settings className="mr-2 h-4 w-4"/>
                        <span>My Orders</span>
                    </Link>
                </DropdownMenuItem>
            )
        }

        // Staff-specific: Dashboard access
        if (canAccess('staffTools')) {
            items.push(
                <DropdownMenuItem key="staff-dashboard" asChild>
                    <Link href="/staff">
                        <Wrench className="mr-2 h-4 w-4"/>
                        <span>Staff Dashboard</span>
                    </Link>
                </DropdownMenuItem>
            )
        }

        // Admin-specific: Admin Panel
        if (canAccess('adminPanel')) {
            items.push(
                <DropdownMenuItem key="admin-panel" asChild>
                    <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4"/>
                        <span>Admin Panel</span>
                    </Link>
                </DropdownMenuItem>
            )
        }

        // Optional: Direct links for common admin tasks
        if (canAccess('userManagement')) {
            items.push(
                <DropdownMenuItem key="user-management" asChild>
                    <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4"/>
                        <span>Manage Users</span>
                    </Link>
                </DropdownMenuItem>
            )
        }

        if (canAccess('reporting')) {
            items.push(
                <DropdownMenuItem key="reports" asChild>
                    <Link href="/admin/reports">
                        <BarChart3 className="mr-2 h-4 w-4"/>
                        <span>Reports</span>
                    </Link>
                </DropdownMenuItem>
            )
        }

        return items
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""}/>
                        <AvatarFallback>
                            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                        </p>
                        <p className="text-xs leading-none text-blue-600 font-medium">
                            {getRoleDisplay()}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>

                {getMenuItems()}

                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}