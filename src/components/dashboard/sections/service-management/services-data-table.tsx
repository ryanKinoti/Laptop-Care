'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {DataTable} from '@/components/ui/data-table'
import {useDashboardStore} from '@/stores/dashboard-store'
import {getServiceListAction, getServiceCategoriesAction} from '@/lib/actions/service'
import {ServiceListClientDTO, ServiceFilters, ServiceCategoryWithServicesClientDTO} from '@/types/service'
import {ColumnDef} from '@tanstack/react-table'
import {Eye, Edit, Trash2, Plus, Package} from 'lucide-react'
import {DataTableFilter, DataTableAction} from '@/types/data-table'
import {
    createTextColumn, 
    createBadgeColumn, 
    createCurrencyColumn,
    commonFilters, 
    commonBadges
} from '@/lib/data-table-utils'

interface ServicesDataTableProps {
    onServiceSelect: (serviceId: string) => void
    onCreateService?: () => void
    onEditService?: (serviceId: string) => void
    onDeleteService?: (serviceId: string) => void
    onRestoreService?: (serviceId: string) => void
}

export function ServicesDataTable({
    onServiceSelect,
    onCreateService,
    onEditService,
    onDeleteService,
    onRestoreService
}: ServicesDataTableProps) {
    const [services, setServices] = useState<ServiceListClientDTO[]>([])
    const [categories, setCategories] = useState<ServiceCategoryWithServicesClientDTO[]>([])
    const [error, setError] = useState<string | null>(null)

    const servicesLoading = useDashboardStore(state => state.servicesLoading)
    const servicesRefreshing = useDashboardStore(state => state.servicesRefreshing)
    const setServicesLoading = useDashboardStore(state => state.setServicesLoading)
    const setServicesRefreshing = useDashboardStore(state => state.setServicesRefreshing)
    const serviceDataRefreshKey = useDashboardStore(state => state.serviceDataRefreshKey)

    const fetchServices = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setServicesRefreshing(true)
            } else {
                setServicesLoading(true)
            }
            setError(null)

            const baseFilters: ServiceFilters = {isActive: true}
            const result = await getServiceListAction(baseFilters, 1, 50)
            
            if (result.success && result.data) {
                setServices(result.data.services)
            } else {
                setError(result.error || 'Failed to fetch services')
                setServices([])
            }
        } catch (err) {
            setError('An unexpected error occurred')
            setServices([])
            console.error('Services fetch error:', err)
        } finally {
            setServicesLoading(false)
            setServicesRefreshing(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const result = await getServiceCategoriesAction(true)
            if (result.success && result.data) {
                setCategories(result.data)
            }
        } catch (err) {
            console.error('Categories fetch error:', err)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchServices()
    }, [])

    useEffect(() => {
        fetchServices()
    }, [serviceDataRefreshKey])

    const handleRefresh = () => {
        fetchServices(true)
    }

    // Define columns using the centralized system
    const columns: ColumnDef<ServiceListClientDTO>[] = [
        {
            accessorKey: 'name',
            header: 'Service Name',
            cell: ({row}) => {
                const service = row.original
                return (
                    <div className="space-y-1">
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                                {service.description}
                            </div>
                        )}
                    </div>
                )
            }
        },
        createBadgeColumn('categoryName', 'Category', commonBadges.serviceCategory),
        createBadgeColumn('device', 'Device', commonBadges.deviceType),
        createCurrencyColumn('price', 'Price'),
        createTextColumn('estimatedTime', 'Est. Time', {
            className: 'text-sm text-muted-foreground'
        }),
        createBadgeColumn('isActive', 'Status', commonBadges.status),
    ]

    // Define filters
    const filters: DataTableFilter[] = [
        commonFilters.serviceCategory(
            categories.map(cat => ({label: cat.name, value: cat.id}))
        ),
        commonFilters.deviceType(),
        commonFilters.status()
    ]

    // Define actions
    const actions: DataTableAction<ServiceListClientDTO>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (service) => onServiceSelect(service.id),
            variant: 'ghost',
            size: 'sm',
        },
    ]

    if (onEditService) {
        actions.push({
            label: 'Edit',
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (service) => onEditService(service.id),
            variant: 'ghost',
            size: 'sm',
        })
    }

    if (onDeleteService) {
        actions.push({
            label: (service: ServiceListClientDTO) => service.isActive ? 'Disable' : 'Enable',
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (service) => service.isActive ? onDeleteService(service.id) : onRestoreService?.(service.id),
            variant: 'ghost',
            size: 'sm',
        })
    }

    // Define toolbar actions
    const toolbarActions = (
        <>
            {onCreateService && (
                <Button onClick={onCreateService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                </Button>
            )}
        </>
    )

    return (
        <DataTable
            data={services}
            columns={columns}
            loading={servicesLoading}
            refreshing={servicesRefreshing}
            error={error}
            searchable={true}
            searchPlaceholder="Search services..."
            searchColumns={['name', 'categoryName']}
            filters={filters}
            actions={actions}
            toolbarActions={toolbarActions}
            onRefresh={handleRefresh}
            emptyMessage="No services found"
            emptyIcon={<Package className="h-8 w-8 text-muted-foreground" />}
            pagination={true}
            pageSize={20}
            pageSizeOptions={[10, 20, 30, 50]}
        />
    )
}