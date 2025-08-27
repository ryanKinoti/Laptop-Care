'use client'

import {useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Badge} from '@/components/ui/badge'
import {Separator} from '@/components/ui/separator'
import {Skeleton} from '@/components/ui/skeleton'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {useDashboardStore} from '@/stores/dashboard-store'
import {getServiceWithCategoryAction} from '@/lib/actions/service'
import {ServiceWithCategoryClientDTO} from '@/types/service'
import {
    ArrowLeft,
    Edit,
    Trash2,
    RotateCcw,
    Package,
    Tag,
    Clock,
    DollarSign,
    Monitor,
    FileText
} from 'lucide-react'
import {formatCurrency} from '@/lib/utils'

interface ServiceDetailsProps {
    serviceId: string
    onBack: () => void
    onEdit?: (serviceId: string) => void
    onDelete?: (serviceId: string) => void
    onRestore?: (serviceId: string) => void
}

export function ServiceDetails({
                                   serviceId,
                                   onBack,
                                   onEdit,
                                   onDelete,
                                   onRestore
                               }: ServiceDetailsProps) {
    const [service, setService] = useState<ServiceWithCategoryClientDTO | null>(null)
    const [error, setError] = useState<string | null>(null)

    const serviceDetailsLoading = useDashboardStore(state => state.serviceDetailsLoading)
    const serviceDetailsRefreshing = useDashboardStore(state => state.serviceDetailsRefreshing)
    const setServiceDetailsLoading = useDashboardStore(state => state.setServiceDetailsLoading)
    const setServiceDetailsRefreshing = useDashboardStore(state => state.setServiceDetailsRefreshing)
    const serviceDataRefreshKey = useDashboardStore(state => state.serviceDataRefreshKey)

    const isLoading = serviceDetailsLoading || serviceDetailsRefreshing

    const fetchService = async () => {
        try {
            if (!service) {
                setServiceDetailsLoading(true)
            } else {
                setServiceDetailsRefreshing(true)
            }
            setError(null)

            const result = await getServiceWithCategoryAction(serviceId)
            if (result.success && result.data) {
                setService(result.data)
            } else {
                setError(result.error || 'Failed to fetch service details')
                setService(null)
            }
        } catch (err) {
            setError('An unexpected error occurred')
            setService(null)
            console.error('Service details fetch error:', err)
        } finally {
            setServiceDetailsLoading(false)
            setServiceDetailsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchService()
    }, [serviceId, serviceDataRefreshKey])

    if (isLoading && !service) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-20"/>
                    <Skeleton className="h-8 w-48"/>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-24"/>
                                    <Skeleton className="h-4 w-32"/>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <Skeleton className="h-4 w-20"/>
                                    <Skeleton className="h-4 w-28"/>
                                </div>
                            ))}
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
                    <h2 className="text-2xl font-bold tracking-tight">Service Details</h2>
                </div>

                <Alert variant="destructive">
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Service Details</h2>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto"/>
                            <h3 className="text-lg font-semibold">Service Not Found</h3>
                            <p className="text-muted-foreground">
                                The requested service could not be found.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2"/>
                        Back
                    </Button>
                    <h2 className="text-2xl font-bold tracking-tight">Service Details</h2>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                        {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>

                <div className="flex items-center gap-2">
                    {onEdit && (
                        <Button variant="outline" onClick={() => onEdit(service.id)}>
                            <Edit className="h-4 w-4 mr-2"/>
                            Edit
                        </Button>
                    )}

                    {service.isActive ? (
                        onDelete && (
                            <Button
                                variant="outline"
                                onClick={() => onDelete(service.id)}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2"/>
                                Disable
                            </Button>
                        )
                    ) : (
                        onRestore && (
                            <Button
                                variant="outline"
                                onClick={() => onRestore(service.id)}
                                className="text-green-600 hover:text-green-600"
                            >
                                <RotateCcw className="h-4 w-4 mr-2"/>
                                Enable
                            </Button>
                        )
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5"/>
                            Service Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Service Name:</span>
                                <span className="font-medium">{service.name}</span>
                            </div>

                            <Separator/>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Category:</span>
                                <Badge variant="outline">
                                    <Tag className="h-3 w-3 mr-1"/>
                                    {service.category.name}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Device Type:</span>
                                <Badge variant="secondary">
                                    <Monitor className="h-3 w-3 mr-1"/>
                                    {service.device.charAt(0).toUpperCase() + service.device.slice(1).toLowerCase()}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Price:</span>
                                <span className="font-mono font-bold text-lg">
                                    <DollarSign className="h-4 w-4 inline mr-1"/>
                                    {formatCurrency(service.price)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Estimated Time:</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground"/>
                                    {service.estimatedTime}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                                <Badge variant={service.isActive ? "default" : "secondary"}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5"/>
                            Additional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div>
                                <span
                                    className="text-sm font-medium text-muted-foreground block mb-2">Description:</span>
                                <p className="text-sm leading-relaxed">
                                    {service.description || (
                                        <span className="text-muted-foreground italic">No description available</span>
                                    )}
                                </p>
                            </div>

                            <Separator/>

                            <div>
                                <span className="text-sm font-medium text-muted-foreground block mb-2">Notes:</span>
                                <p className="text-sm leading-relaxed">
                                    {service.notes || (
                                        <span className="text-muted-foreground italic">No notes available</span>
                                    )}
                                </p>
                            </div>

                            <Separator/>

                            <div>
                                <span className="text-sm font-medium text-muted-foreground block mb-2">Category Description:</span>
                                <p className="text-sm leading-relaxed">
                                    {service.category.description || (
                                        <span
                                            className="text-muted-foreground italic">No category description available</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Service ID for debugging/reference */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Service ID: {service.id}</span>
                        <span>Category ID: {service.categoryId}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}