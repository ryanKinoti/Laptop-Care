'use client'

import {useSession, signIn, signOut} from "next-auth/react"
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
import {User, Settings, LogOut, Shield} from "lucide-react"

export function AuthButtons() {
    const {data: session, status} = useSession()

    if (status === "loading") {
        return (
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20"/>
                <Skeleton className="h-8 w-8 rounded-full"/>
            </div>
        )
    }

    if (!session) {
        return (
            <Button onClick={() => signIn()} variant="outline" size="sm">
                Sign In
            </Button>
        )
    }

    // Check if user is staff (admin/employee)
    const isStaff = (session.user as any)?.isStaff || false

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""}/>
                        <AvatarFallback>
                            {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>

                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4"/>
                    <span>Profile</span>
                </DropdownMenuItem>

                {isStaff ? (
                    <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4"/>
                        <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4"/>
                        <span>My Orders</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}