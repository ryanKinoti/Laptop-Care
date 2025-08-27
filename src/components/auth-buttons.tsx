'use client'

import {signInAction} from "@/lib/actions/auth"
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
import {User, LogOut, BarChart3} from "lucide-react"
import {useAuthStore, useAuthSync} from '@/stores/auth-store'
import Link from "next/link"
import {signOut} from "next-auth/react";

export function AuthButtons() {
    const {isInitialized, status} = useAuthSync()
    const session = useAuthStore(state => state.session)
    const user = useAuthStore(state => state.user) // Our custom role data
    const currentRole = useAuthStore(state => state.currentRole)
    const canAccess = useAuthStore(state => state.canAccess)

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
            <form action={signInAction}>
                <Button type="submit" variant="outline" size="sm">
                    Sign In
                </Button>
            </form>
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

        // Staff roles: Dashboard access (all staff roles get dashboard)
        if (user.isStaff && canAccess('dashboard')) {
            items.push(
                <DropdownMenuItem key="dashboard" asChild>
                    <Link href="/dashboard">
                        <BarChart3 className="mr-2 h-4 w-4"/>
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
            )
        }

        // Customer roles: Customer portal access
        if (currentRole === 'customer' && canAccess('customerOrders')) {
            items.push(
                <DropdownMenuItem key="customer-dashboard" asChild>
                    <Link href="/customer">
                        <BarChart3 className="mr-2 h-4 w-4"/>
                        <span>My Account</span>
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