'use client'

import React, {useState} from 'react'
import {Navigation} from '@/components/navigation'
import {CustomerSidebar} from './customer-sidebar'
import {Button} from '@/components/ui/button'
import {Menu} from 'lucide-react'

interface CustomerLayoutProps {
    children: React.ReactNode
}

export function CustomerLayout({children}: CustomerLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background">
            <Navigation/>

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`
                    fixed inset-y-16 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <CustomerSidebar onClose={() => setSidebarOpen(false)}/>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Mobile menu button */}
                    <div className="lg:hidden p-4 border-b">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-4 w-4 mr-2"/>
                            Menu
                        </Button>
                    </div>

                    {/* Content area */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}