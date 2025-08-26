'use client'

import React, {useState} from 'react'
import {useAuthStore} from '@/stores/auth-store'
import {DashboardHeader} from './dashboard-header'
import {DashboardSidebar} from './dashboard-sidebar'
import {redirect} from 'next/navigation'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({children}: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const user = useAuthStore(state => state.user)
    const canAccess = useAuthStore(state => state.canAccess)

    // Redirect non-staff users
    if (!user?.isStaff || !canAccess('dashboard')) {
        redirect('/')
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            <DashboardHeader
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
            />
            <div className="flex-1 flex overflow-hidden">
                <DashboardSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}