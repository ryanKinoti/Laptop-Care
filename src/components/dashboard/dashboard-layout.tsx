'use client'

import React, {useState} from 'react'
import {DashboardHeader} from './dashboard-header'
import {DashboardSidebar} from './dashboard-sidebar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({children}: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

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