'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/auth-store'
import {
    Home,
    Package,
    Clock,
    FileText,
    User,
    X,
} from 'lucide-react'
import React, { useState } from 'react'

interface SidebarItem {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    href?: string
    onClick?: () => void
}

interface CustomerSidebarProps {
    onClose: () => void
}

export function CustomerSidebar({ onClose }: CustomerSidebarProps) {
    const [activeSection, setActiveSection] = useState('overview')
    const session = useAuthStore(state => state.session)

    const sidebarItems: SidebarItem[] = [
        {
            id: 'overview',
            label: 'Overview',
            icon: Home,
        },
        {
            id: 'orders',
            label: 'My Orders',
            icon: Package,
        },
        {
            id: 'history',
            label: 'Service History',
            icon: Clock,
        },
        {
            id: 'documents',
            label: 'Documents & Receipts',
            icon: FileText,
        },
        {
            id: 'profile',
            label: 'Profile Settings',
            icon: User,
        },
    ]

    const handleSectionClick = (id: string) => {
        setActiveSection(id)
        onClose() // Close mobile sidebar
    }

    return (
        <div className="h-full bg-background border-r flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Customer Portal</h2>
                    <p className="text-sm text-muted-foreground">
                        {session?.user?.name || 'Customer'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="lg:hidden"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <nav className="space-y-2">
                    {sidebarItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeSection === item.id ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start",
                                activeSection === item.id && "bg-secondary"
                            )}
                            onClick={() => handleSectionClick(item.id)}
                        >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t">
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>Need help?</p>
                    <Button variant="link" className="h-auto p-0 text-xs">
                        Contact Support
                    </Button>
                </div>
            </div>
        </div>
    )
}