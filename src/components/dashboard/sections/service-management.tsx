'use client'

import {Card, CardContent, CardHeader} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {useAuthStore} from '@/stores/auth-store'
import {useDashboardStore, ServiceManagementSection} from '@/stores/dashboard-store'
import {ServiceOverview} from './service-management/service-overview'
import {ServicesDataTable} from './service-management/services-data-table'
import {ServiceDetails} from './service-management/service-details'
import {CategoriesDataTable} from './service-management/categories-data-table'
import {CategoryDetails} from './service-management/category-details'
import {cn} from '@/lib/utils'
import {Lock} from 'lucide-react'

export function ServiceManagement() {
    const user = useAuthStore(state => state.user)
    const currentRole = useAuthStore(state => state.currentRole)

    const activeTab = useDashboardStore(state => state.serviceManagementSection)
    const selectedServiceId = useDashboardStore(state => state.selectedServiceId)
    const selectedServiceCategoryId = useDashboardStore(state => state.selectedServiceCategoryId)
    const setActiveTab = useDashboardStore(state => state.setServiceManagementSection)
    const setSelectedServiceId = useDashboardStore(state => state.setSelectedServiceId)
    const setSelectedServiceCategoryId = useDashboardStore(state => state.setSelectedServiceCategoryId)
    const refreshServiceData = useDashboardStore(state => state.refreshServiceData)
    const refreshServiceStats = useDashboardStore(state => state.refreshServiceStats)
    const refreshCategoryData = useDashboardStore(state => state.refreshCategoryData)

    const hasAccess = user?.staffRole === 'ADMINISTRATOR' ||
        currentRole === 'admin' ||
        currentRole === 'superuser'

    if (!hasAccess) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Lock className="h-12 w-12 text-muted-foreground mx-auto"/>
                            <h3 className="text-lg font-semibold">Access Restricted</h3>
                            <p className="text-muted-foreground">
                                Service management is only available to administrators.
                            </p>
                            <Badge variant="outline" className="text-destructive">
                                Insufficient Permissions
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const tabs = [
        {id: 'overview' as ServiceManagementSection, label: 'Overview'},
        {id: 'services' as ServiceManagementSection, label: 'Services'},
        {id: 'categories' as ServiceManagementSection, label: 'Categories'},
        {
            id: 'service-details' as ServiceManagementSection,
            label: 'Service Details',
            disabled: !selectedServiceId
        },
        {
            id: 'category-details' as ServiceManagementSection,
            label: 'Category Details',
            disabled: !selectedServiceCategoryId
        }
    ]

    const handleServiceSelect = (serviceId: string) => {
        setSelectedServiceId(serviceId)
        setActiveTab('service-details')
    }

    const handleCategorySelect = (categoryId: string) => {
        setSelectedServiceCategoryId(categoryId)
        setActiveTab('category-details')
    }

    const handleBackToServices = () => {
        setActiveTab('services')
        refreshServiceData()
        refreshServiceStats()
    }

    const handleBackToCategories = () => {
        setActiveTab('categories')
        refreshCategoryData()
    }

    const handleServiceSelectFromCategory = (serviceId: string) => {
        setSelectedServiceId(serviceId)
        setActiveTab('service-details')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
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
                                )}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent>
                    {activeTab === 'overview' && <ServiceOverview/>}

                    {activeTab === 'services' && (
                        <ServicesDataTable onServiceSelect={handleServiceSelect}/>
                    )}

                    {activeTab === 'categories' && (
                        <CategoriesDataTable onCategorySelect={handleCategorySelect}/>
                    )}

                    {activeTab === 'service-details' && selectedServiceId && (
                        <ServiceDetails
                            serviceId={selectedServiceId}
                            onBack={handleBackToServices}
                        />
                    )}

                    {activeTab === 'category-details' && selectedServiceCategoryId && (
                        <CategoryDetails
                            categoryId={selectedServiceCategoryId}
                            onBack={handleBackToCategories}
                            onServiceSelect={handleServiceSelectFromCategory}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}