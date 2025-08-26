'use client'

import Image from 'next/image'
import Link from 'next/link'
import {Button} from "@/components/ui/button"
import {AuthButtons} from "@/components/auth-buttons"
import {useAuthStore} from '@/stores/auth-store'
import {Menu} from "lucide-react"
import {SessionProvider} from "next-auth/react"
import {ThemeToggle} from "@/components/navigation";

interface DashboardHeaderProps {
    sidebarCollapsed: boolean
    setSidebarCollapsed: (collapsed: boolean) => void
}

function DashboardHeaderContent({sidebarCollapsed, setSidebarCollapsed}: DashboardHeaderProps) {
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)

    const getRoleTitle = () => {
        switch (currentRole) {
            case 'superuser':
                return 'Super Admin'
            case 'admin':
                return 'Administrator'
            case 'staff':
                switch (user?.staffRole) {
                    case 'TECHNICIAN':
                        return 'Technician'
                    case 'RECEPTIONIST':
                        return 'Receptionist'
                    case 'ADMINISTRATOR':
                        return 'Administrator'
                    default:
                        return 'Staff'
                }
            default:
                return 'Dashboard'
        }
    }

    return (
        <header
            className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="md:hidden">
                        <Menu className="h-4 w-4"/>
                    </Button>

                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/lcs_main_logo.png"
                            alt="Laptop Care Services"
                            width={80}
                            height={30}
                            className="bg-white rounded-md w-auto h-auto"
                            priority
                        />
                    </Link>

                    <div className="hidden md:block">
                        <h1 className="text-lg font-semibold text-foreground">
                            {getRoleTitle()}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <ThemeToggle/>
                    <AuthButtons/>
                </div>
            </div>
        </header>
    )
}

export function DashboardHeader(props: DashboardHeaderProps) {
    return (
        <SessionProvider>
            <DashboardHeaderContent {...props} />
        </SessionProvider>
    )
}