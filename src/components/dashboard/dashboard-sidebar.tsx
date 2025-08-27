'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuthStore } from '@/stores/auth-store'
import { useDashboardStore, DashboardSection } from '@/stores/dashboard-store'
import {
    LayoutDashboard,
    Users,
    Settings,
    Package,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import React from "react";

interface SidebarItem {
    id: DashboardSection
    label: string
    icon: React.ComponentType<{ className?: string }>
    requiredPermissions?: string[]
    allowedRoles?: ('admin' | 'superuser' | 'staff')[]
    staffRoles?: ('ADMINISTRATOR' | 'TECHNICIAN' | 'RECEPTIONIST')[]
}

const sidebarItems: SidebarItem[] = [
    {
        id: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
    },
    {
        id: 'users',
        label: 'User Management',
        icon: Users,
        staffRoles: ['ADMINISTRATOR', 'TECHNICIAN', 'RECEPTIONIST'],
    },
    {
        id: 'services',
        label: 'Service Management',
        icon: Settings,
        staffRoles: ['ADMINISTRATOR'],
    },
    {
        id: 'inventory',
        label: 'Inventory Management',
        icon: Package,
        staffRoles: ['ADMINISTRATOR', 'TECHNICIAN'],
    },
]

interface DashboardSidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function DashboardSidebar({ collapsed, onToggle }: DashboardSidebarProps) {
    // Use existing auth store states - single source of truth
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)
    
    // Using a centralized dashboard state
    const activeSection = useDashboardStore(state => state.activeSection)
    const setActiveSection = useDashboardStore(state => state.setActiveSection)

    const canAccessItem = (item: SidebarItem) => {
        // Admin and superuser can access everything
        if (currentRole === 'admin' || currentRole === 'superuser') {
            return true
        }

        // For staff users, check their specific staff role permissions
        if (currentRole === 'staff' && user?.staffRole) {
            // If the item has staffRoles defined, check if user's staff role is allowed
            if (item.staffRoles) {
                return item.staffRoles.includes(user.staffRole)
            }
            // If no specific staff roles defined, allow access (for overview)
            return true
        }

        // For customer users or users without staff roles
        if (currentRole === 'customer') {
            // Customers shouldn't access dashboard items (this is just a safety check)
            return false
        }

        // Default allow for overview and other general items
        return !item.allowedRoles && !item.staffRoles
    }

    const filteredItems = sidebarItems.filter(canAccessItem)

    return (
        <div className={cn(
            "relative border-r bg-background transition-all duration-300",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between p-4">
                    {!collapsed && (
                        <h2 className="text-lg font-semibold">Dashboard</h2>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="hidden md:flex">
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3">
                    <nav className="space-y-2">
                        <TooltipProvider>
                            {filteredItems.map((item) => (
                                <Tooltip key={item.id}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={activeSection === item.id ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start",
                                                collapsed && "justify-center px-2"
                                            )}
                                            onClick={() => setActiveSection(item.id)}>
                                            <item.icon className="h-4 w-4" />
                                            {!collapsed && (
                                                <span className="ml-2">{item.label}</span>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    {collapsed && (
                                        <TooltipContent side="right" className="ml-2">
                                            <p>{item.label}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </nav>
                </ScrollArea>
            </div>
        </div>
    )
}