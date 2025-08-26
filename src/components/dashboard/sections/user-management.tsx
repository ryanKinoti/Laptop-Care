'use client'

import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {UserOverview} from './user-management/user-overview'
import {UserDataTable} from './user-management/user-data-table'
import {UserDetails} from './user-management/user-details'
import {useDashboardStore, UserManagementSection} from '@/stores/dashboard-store'
import {cn} from '@/lib/utils'

export function UserManagement() {
    const activeTab = useDashboardStore(state => state.userManagementSection)
    const selectedUserId = useDashboardStore(state => state.selectedUserId)
    const setActiveTab = useDashboardStore(state => state.setUserManagementSection)
    const setSelectedUserId = useDashboardStore(state => state.setSelectedUserId)
    const refreshUserData = useDashboardStore(state => state.refreshUserData)
    const refreshUserStats = useDashboardStore(state => state.refreshUserStats)

    const tabs = [
        {id: 'overview' as UserManagementSection, label: 'Overview'},
        {id: 'data-table' as UserManagementSection, label: 'User Data Table'},
        {
            id: 'details' as UserManagementSection,
            label: 'View Details',
            disabled: !selectedUserId
        },
    ]

    const handleUserSelect = (userId: string) => {
        setSelectedUserId(userId)
        setActiveTab('details')
    }

    const handleBackToDataTable = () => {
        setActiveTab('data-table')
        // Refresh data when going back to ensure fresh stats
        refreshUserData()
        refreshUserStats()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex space-x-1">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "secondary" : "ghost"}
                                onClick={() => setActiveTab(tab.id)}
                                disabled={tab.disabled}
                                className={cn(
                                    "px-3 py-1.5 text-sm",
                                    tab.disabled && "opacity-50 cursor-not-allowed"
                                )}>
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent>
                    {activeTab === 'overview' && <UserOverview />}
                    {activeTab === 'data-table' && (
                        <UserDataTable onUserSelect={handleUserSelect} />
                    )}
                    {activeTab === 'details' && selectedUserId && (
                        <UserDetails
                            userId={selectedUserId}
                            onBack={handleBackToDataTable}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}