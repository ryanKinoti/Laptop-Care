'use client'

import {useDashboardStore} from '@/stores/dashboard-store'
import {DashboardOverview} from './sections/dashboard-overview'
import {UserManagement} from './sections/user-management'
import {ServiceManagement} from './sections/service-management'
import {InventoryManagement} from './sections/inventory-management'

export function DashboardContent() {
    const activeSection = useDashboardStore(state => state.activeSection)

    const renderSection = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardOverview/>
            case 'users':
                return <UserManagement/>
            case 'services':
                return <ServiceManagement/>
            case 'inventory':
                return <InventoryManagement/>
            default:
                return <DashboardOverview/>
        }
    }

    return (
        <div className="space-y-6">
            {renderSection()}
        </div>
    )
}