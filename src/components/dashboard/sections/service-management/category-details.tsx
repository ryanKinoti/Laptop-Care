'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'
import {Skeleton} from '@/components/ui/skeleton'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {DataTable} from '@/components/ui/data-table'
import {useDashboardStore} from '@/stores/dashboard-store'
import {getServiceCategoriesForAdminAction} from '@/lib/actions/service'
import {ServiceCategoryWithServicesClientDTO} from '@/types/service'
import {DeviceType} from '@prisma/client'
import {ColumnDef} from '@tanstack/react-table'
import {
    ArrowLeft,
    Edit,
    Tag,
    Package,
    Activity,
    Monitor,
    Clock
} from 'lucide-react'
import {formatCurrency} from '@/lib/utils'

interface CategoryDetailsProps {
    categoryId: string
    onBack: () => void
    onEdit?: (categoryId: string) => void
    onServiceSelect?: (serviceId: string) => void
}

export function CategoryDetails({
                                    categoryId,
                                    onBack,
                                    onEdit,
                                    onServiceSelect
                                }: CategoryDetailsProps) {
    const [category, setCategory] = useState<ServiceCategoryWithServicesClientDTO | null>(null)
    const [error, setError] = useState<string | null>(null)

    const categoryDetailsLoading = useDashboardStore(state => state.categoryDetailsLoading)
    const categoryDetailsRefreshing = useDashboardStore(state => state.categoryDetailsRefreshing)
    const setCategoryDetailsLoading = useDashboardStore(state => state.setCategoryDetailsLoading)
    const setCategoryDetailsRefreshing = useDashboardStore(state => state.setCategoryDetailsRefreshing)
    const categoryDataRefreshKey = useDashboardStore(state => state.categoryDataRefreshKey)

    const isLoading = categoryDetailsLoading || categoryDetailsRefreshing

    const fetchCategory = async () => {
        try {
            if (!category) {
                setCategoryDetailsLoading(true)
            } else {
                setCategoryDetailsRefreshing(true)
            }
            setError(null)

            const result = await getServiceCategoriesForAdminAction(true)
            if (result.success && result.data) {
                const foundCategory = result.data.find(cat => cat.id === categoryId)
                if (foundCategory) {
                    setCategory(foundCategory)
                } else {
                    setError('Category not found')
                    setCategory(null)
                }
            } else {
                setError(result.error || 'Failed to fetch category details')
                setCategory(null)
            }
        } catch (err) {
            setError('An unexpected error occurred')
            setCategory(null)
            console.error('Category details fetch error:', err)
        } finally {
            setCategoryDetailsLoading(false)
            setCategoryDetailsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchCategory()
    }, [categoryId, categoryDataRefreshKey])

    const serviceColumns: ColumnDef<ServiceCategoryWithServicesClientDTO['services'][0]>[] = [
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
        {
            accessorKey: 'device',
            header: 'Device',
            cell: ({row}) => {
                const device = row.getValue('device') as DeviceType
                return (
                    <Badge variant="secondary">
                        <Monitor className="h-3 w-3 mr-1"/>
                        {device.charAt(0).toUpperCase() + device.slice(1).toLowerCase()}
                    </Badge>
                )
            }
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({row}) => {
                const price = row.getValue('price') as number
                return (
                    <span className="font-mono font-medium">
                        {formatCurrency(price)}
                    </span>
                )
            }
        },
        {
            accessorKey: 'estimatedTime',
            header: 'Est. Time',
            cell: ({row}) => {
                return (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3"/>
                        {row.getValue('estimatedTime')}
                    </span>
                )
            }
        },
        {
            accessorKey: 'isActive',
            header: 'Status',
            cell: ({row}) => {
                const isActive = row.getValue('isActive') as boolean
                return (
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                )
            }
        }
    ]

    // Add actions column only if onServiceSelect is provided
    if (onServiceSelect) {
        serviceColumns.push({
            id: 'actions',
            header: 'Actions',
            cell: ({row}) => {
                const service = row.original
                return (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onServiceSelect(service.id)}
                        className="h-8 w-8 p-0"
                    >
                        <Package className="h-4 w-4"/>
                    </Button>
                )
            }
        })
    }

    if (isLoading && !category) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-20"/>
                    <Skeleton className="h-8 w-48"/>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-32"/>
                                    <Skeleton className="h-4 w-24"/>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32"/>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full"/>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Category Details</h2>
                </div>

                <Alert variant="destructive">
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!category) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Category Details</h2>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Tag className="h-12 w-12 text-muted-foreground mx-auto"/>
                            <h3 className="text-lg font-semibold">Category Not Found</h3>
                            <p className="text-muted-foreground">
                                The requested service category could not be found.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const activeServices = category.services.filter(s => s.isActive)
    const inactiveServices = category.services.filter(s => !s.isActive)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Category Details</h2>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {onEdit && (
                        <Button variant="outline" onClick={() => onEdit(category.id)}>
                            <Edit className="h-4 w-4 mr-2"/>
                            Edit Category
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5"/>
                            Category Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Category Name:</span>
                                <span className="font-medium">{category.name}</span>
                            </div>

                            <Separator/>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Total Services:</span>
                                <Badge variant="outline" className="font-mono">
                                    {category._count.services}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Active Services:</span>
                                <Badge variant="default" className="font-mono">
                                    {activeServices.length}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Inactive Services:</span>
                                <Badge variant="secondary" className="font-mono">
                                    {inactiveServices.length}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                    <Activity className="h-3 w-3 mr-1"/>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>

                        {category.description && (
                            <>
                                <Separator/>
                                <div>
                                    <span
                                        className="text-sm font-medium text-muted-foreground block mb-2">Description:</span>
                                    <p className="text-sm leading-relaxed">
                                        {category.description}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5"/>
                            Services in Category ({category.services.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={serviceColumns}
                            data={category.services}
                            emptyMessage="No services in this category"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Category ID for debugging/reference */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                        <span>Category ID: {category.id}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}